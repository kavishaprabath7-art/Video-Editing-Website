const fs = require('fs');

async function main() {
  let html = fs.readFileSync('index.html', 'utf8');
  const vimeoIds = [
    "1166922976", "1166923241", "1166922921",
    "1166922380", "1166922195", "1181229165"
  ];
  
  for (const id of vimeoIds) {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`);
    const data = await res.json();
    let thumb = data.thumbnail_url;
    // Replace the default width (e.g. 200x150) with original resolution
    thumb = thumb.replace(/_\d+x\d+/, '_1280x720'); 
    
    // The regex to find the iframe for this ID
    const iframeRegex = new RegExp(`<iframe src="https:\\/\\/player\\.vimeo\\.com\\/video\\/${id}\\?[^"]*"[^>]*><\\/iframe>`, 'g');
    
    html = html.replace(iframeRegex, `<img src="${thumb}" alt="Project Thumbnail" class="work-card__poster-img" loading="lazy">`);
  }
  
  fs.writeFileSync('index.html', html);
  console.log("Done");
}
main();
