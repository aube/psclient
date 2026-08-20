/**
 * Модуль скрытой валидации формы на базе фонового Web Worker (Спецификация ALTCHA v2).
 * Полностью автономен, включает систему трассировки логов вычислений.
 */

// Инлайновый код для Web Worker с расширенным логированием и обработкой исключений
const workerBlobCode = `
    self.onmessage = async function(e) {
        self.postMessage({ status: 'log', message: 'Воркер запущен. Получены параметры: ' + JSON.stringify(e.data) });
        
        try {
            const { algorithm, nonce, salt, cost, keyLength, keyPrefix, maxnumber } = e.data;
            const maxIterations = maxnumber || 100000;
            const iterationsCount = cost || 5000;
            const lengthBits = (keyLength || 32) * 8;

            // Функция перевода Hex-строки бэкенда в бинарный массив байт (Uint8Array)
            const hexToBytes = (hex) => {
                if (!hex || hex.length % 2 !== 0) return new Uint8Array(0);
                const bytes = new Uint8Array(hex.length / 2);
                for (let i = 0; i < hex.length; i += 2) {
                    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
                }
                return bytes;
            };

            // Функция перевода ArrayBuffer в шестнадцатеричную строку (Hex)
            const bufToHex = (buffer) => {
                return Array.prototype.map.call(new Uint8Array(buffer), x => ('0' + x.toString(16)).slice(-2)).join('');
            };

            if (!algorithm) {
                throw new Error('Поле "algorithm" отсутствует в параметрах задачи бэкенда.');
            }

            // Декодируем Hex-данные бэкенда в бинарные массивы
            const saltBytes = hexToBytes(salt);
            const nonceBytes = hexToBytes(nonce);

            // Аллоцируем единый бинарный буфер для Пароля (Password = nonce + 4 байта counter)
            const passwordBytes = new Uint8Array(nonceBytes.length + 4);
            passwordBytes.set(nonceBytes, 0);
            const passwordView = new DataView(passwordBytes.buffer);

            self.postMessage({ 
                status: 'log', 
                message: 'Данные успешно переведены в бинарный вид. Запуск оптимизированного цикла перебора...' 
            });

            for (let counter = 0; counter <= maxIterations; counter++) {
                let currentHashHex = '';

                // Записываем текущий counter как 4-байтовое целое число (Big-Endian uint32) в конец буфера nonce
                passwordView.setUint32(nonceBytes.length, counter, false);

                try {
                    if (algorithm.startsWith('PBKDF2/')) {
                        const hashAlgo = algorithm.split('/')[1] || 'SHA-256';
                        
                        // Импортируем динамический бинарный пароль (nonce + counter)
                        const keyMaterial = await crypto.subtle.importKey(
                            'raw', 
                            passwordBytes, 
                            'PBKDF2', 
                            false, 
                            ['deriveBits']
                        );
                        
                        // Вычисляем производные биты с солью и заданной стоимостью итераций
                        const derivedBits = await crypto.subtle.deriveBits(
                            { 
                                name: 'PBKDF2', 
                                salt: saltBytes, 
                                iterations: iterationsCount, 
                                hash: hashAlgo 
                            },
                            keyMaterial, 
                            lengthBits
                        );
                        
                        currentHashHex = bufToHex(derivedBits);

                    } else if (algorithm === 'SHA-256') {
                        // Резервный вариант для базового итеративного SHA-256
                        const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
                        currentHashHex = bufToHex(hashBuffer);
                    }
                } catch (cryptoErr) {
                    throw new Error('Сбой SubtleCrypto на итерации ' + counter + ': ' + cryptoErr.message);
                }

                // Сверяем, начинается ли сгенерированный хэш-ключ с keyPrefix сложности
                if (keyPrefix && currentHashHex.startsWith(keyPrefix)) {
                    self.postMessage({ 
                        status: 'log', 
                        message: '✓ Решение найдено досрочно! Итерация (counter): ' + counter 
                    });
                    self.postMessage({ 
                        status: 'success', 
                        solution: { 
                            counter, 
                            derivedKey: currentHashHex 
                        } 
                    });
                    return;
                }

                // Каждые 500 шагов отдаем управление потоку браузера, чтобы избежать зависаний UI
                if (counter % 500 === 0 && counter > 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            
            self.postMessage({ status: 'log', message: 'Внимание: цикл завершен, совпадений с префиксом не обнаружено.' });
            self.postMessage({ status: 'failed' });

        } catch (err) {
            self.postMessage({ status: 'log', message: 'Критическая ошибка внутри Web Worker: ' + err.message });
            self.postMessage({ status: 'failed' });
        }
    };
`;

// Внутреннее состояние процесса вычислений
let APIchallengeUrl = "";
let workerStarted = false;
let workerResolved = false;
let isSubmitPending = false;
let altchaSolutionToken = null;
let altchaWorker = null;

// Глобальные ссылки на данные текущей задачи для корректной сборки Payload
let currentChallengeData = null;

// Глобальные обработчики для связи воркера и событий сабмита формы
let onWorkerSuccessCallback = null;
let onWorkerFailedCallback = null;

/**
 * Инициализирует запрос к бэкенду и запускает фоновый поток вычислений.
 * @param {string} challengeUrl - URL вашего бэкенд эндпоинта для генерации задачи.
 */
async function startBackgroundVerification(challengeUrl) {
    if (workerStarted) return;
    workerStarted = true;

    try {
        const response = await fetch(challengeUrl);
        if (!response.ok) throw new Error('ALTCHA: Не удалось загрузить задачу с сервера (HTTP ' + response.status + ')');
        
        currentChallengeData = await response.json();
        const params = currentChallengeData.parameters || currentChallengeData;

        const blob = new Blob([workerBlobCode], { type: 'application/javascript' });
        altchaWorker = new Worker(URL.createObjectURL(blob));

        // Единый приемник сообщений из фонового воркера
        altchaWorker.onmessage = function(e) {
            const { status, solution, message } = e.data;

            // Перехват и проброс логов отладки в консоль разработчика
            if (status === 'log' && location.hostname.endsWith('localhost')) {
                console.warn('[ALTCHA WORKER TRACE]:', message);
                return;
            }

            if (status === 'success') {
                const payload = {
                  challenge: currentChallengeData, // как пришло из GET /api/v1/altcha/challenge
                  solution: {
                    counter: solution.counter,
                    derivedKey: solution.derivedKey
                  }
                };
                altchaSolutionToken = btoa(JSON.stringify(payload));

                workerResolved = true;

                if (isSubmitPending && typeof onWorkerSuccessCallback === 'function') {
                    onWorkerSuccessCallback(altchaSolutionToken);
                }
            } else {
                if (typeof onWorkerFailedCallback === 'function') {
                    onWorkerFailedCallback();
                }
            }
        };

        // Передача параметров воркеру для старта brute-force
        altchaWorker.postMessage(params);

    } catch (error) {
        console.error('[ALTCHA CRITICAL ERROR]:', error.message);
        workerStarted = false;
        if (typeof onWorkerFailedCallback === 'function') {
            onWorkerFailedCallback();
        }
    }
}

/**
 * Внутренняя функция для инициализации скрытой защиты конкретной формы.
 * 
 * @param {HTMLElement} form - Элемент формы на странице.
 * @param {Function} [onPendingSubmit] - Коллбэк, вызываемый если пользователь нажал сабмит раньше, чем воркер досчитал хэш.
 * @param {Function} [onResetLoading] - Коллбэк для снятия лоадера при ошибке или завершении.
 */
function initInvisibleAltchaForm(form, onPendingSubmit, onResetLoading) {
    if (!form) {
        console.error('ALTCHA: Элемент формы не передан в инициализатор');
        return;
    }

    let hiddenInput = form.querySelector('input[name="altcha"]');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'altcha';
        form.appendChild(hiddenInput);
    }

    const triggerLazyStart = () => startBackgroundVerification(APIchallengeUrl);

    form.addEventListener('focusin', triggerLazyStart, { once: true });
    form.addEventListener('input', triggerLazyStart, { once: true });

    form.addEventListener('submit', function(e) {
        if (workerResolved && altchaSolutionToken) {
            hiddenInput.value = altchaSolutionToken;
        } else {
            e.preventDefault();
            isSubmitPending = true;

            if (typeof onPendingSubmit === 'function') {
                onPendingSubmit();
            }

            onWorkerSuccessCallback = (token) => {
                hiddenInput.value = token;
                form.requestSubmit();
            };

            onWorkerFailedCallback = () => {
                isSubmitPending = false;
                if (typeof onResetLoading === 'function') {
                    onResetLoading();
                }
                alert('Ошибка фоновой верификации устройства. Пожалуйста, попробуйте отправить форму еще раз.');
            };

            if (!workerStarted) {
                triggerLazyStart();
            }
        }
    });
}

/**
 * Инициализирует конфигурацию ALTCHA и возвращает функцию для привязки к конкретной форме.
 * 
 * @param {string} challengeUrl - Эндпоинт бэкенда для генерации задачи капчи.
 * @returns {Function} Функция initInvisibleAltchaForm
 */
export function initAltcha(challengeUrl) {
    APIchallengeUrl = challengeUrl;
    return initInvisibleAltchaForm;
}



