export const stripHtml = (html: string) => {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || '';
};
