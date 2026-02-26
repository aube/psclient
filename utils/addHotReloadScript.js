export function addHotReloadScript(finalHTML) {
  const hotReloadScript = `
    <script>
      // Hot Reload Client Script
      const eventSource = new EventSource('/hot-reload');
      
      eventSource.onmessage = function(event) {
        if (event.data === 'connected') {
          console.log('Hot reload connected');
        } else if (event.data === 'reload') {
          console.log('File changed, reloading...');
          eventSource.close();
          window.location.reload();
        }
      };
      
      eventSource.onerror = function(event) {
        console.log('Hot reload connection error:', event);
      };
    </script>`;
  
  // Inject the script before the closing body tag
  finalHTML = finalHTML.includes('</body>')
    ? finalHTML.replace('</body>', hotReloadScript + '</body>')
    : finalHTML + hotReloadScript;

  return finalHTML
}