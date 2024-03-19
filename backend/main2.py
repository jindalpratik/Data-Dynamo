from rembg import remove
from PIL import Image

input_path = r'./preview16.jpg'
output_path = r'output.png'

input = Image.open(input_path)
output = remove(input)
output = output.convert("RGBA")
data = output.getdata()

new_data = []
for item in data:
    if item[3] == 0:  # check if alpha value is 0 (transparent)
        new_data.append((0, 0, 0, 255))  # set RGB values to black
    else:
        new_data.append(item)

output.putdata(new_data)
output.save(output_path)