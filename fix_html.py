import re

with open('index.html', 'r') as f:
    html = f.read()

# I will replace all iframes inside work-card__embed-wrap with the vumbnail image.
# We know the vimeo IDs of the 6 cards. Let's just find the pattern.
pattern = r'<div class="work-card__embed-wrap">\s*<iframe src="https://player\.vimeo\.com/video/(\d+)[^>]+></iframe>\s*</div>'
replacement = r'<div class="work-card__embed-wrap">\n            <img src="https://vumbnail.com/\1.jpg" alt="Project Poster" class="work-card__poster-img" loading="lazy">\n          </div>'

new_html = re.sub(pattern, replacement, html)

with open('index.html', 'w') as f:
    f.write(new_html)

print("Fixed HTML.")
