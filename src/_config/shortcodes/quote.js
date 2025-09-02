export const quoteShortcode = (content, source) => {
  let sourceCite = '';
  if (source) {
    const url = new URL(source);
    const domain = url.hostname;
    sourceCite = `
      <cite>
        Source: 
        <a href="${source}" target="_blank" rel="noopener noreferrer">
          ${domain}
        </a>
      </cite>
    `;
  }

  return `
    <blockquote class="quote">
      ${content}
      ${sourceCite}
    </blockquote>
  `;
};