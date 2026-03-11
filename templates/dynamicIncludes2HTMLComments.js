// [{NAME}] => <!--NAME--><!--/NAME-->
export function dynamicIncludes2HTMLComments(htmlLayout) {
  return htmlLayout.replace(/\[{([^\]]+)}\]/g, '<!--$1--><!--/$1-->');
}
