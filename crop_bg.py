from PIL import Image
import sys

# Load image
img_path = r"C:\Users\shyam\.gemini\antigravity\brain\d5a0698f-935b-4b57-a145-6080ce878e53\media__1780950688401.jpg"
try:
    img = Image.open(img_path)
    print(f"Original size: {img.size}")
    
    # We want to crop from just below the header (approx y=95) 
    # to just above the chips (approx y=620 on a typical 1080p height image?)
    # Let's save the full image for now and inspect it manually or make a best guess
    # Or actually, we can just save a cropped version.
    
    width, height = img.size
    # Assuming header is ~8% of height, chips start around ~65% of height
    top = int(height * 0.08)
    bottom = int(height * 0.6)
    
    bg_img = img.crop((0, top, width, bottom))
    bg_img.save(r"C:\dragonTiger\src\assets\exact_bg.jpg")
    print("Saved exact_bg.jpg")
    
except Exception as e:
    print(f"Error: {e}")
