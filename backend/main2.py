from rembg import remove

input_path = 'input.png'
output_path = 'output.png'

with open(input_path, 'rb') as i:
    with open(output_path, 'wb') as o:
        input = i.read()
        output = remove(input)
        # Convert the output image to have a black background
        output = output.convert("RGBA")
        data = output.getdata()

        new_data = []
        for item in data:
            # Set the alpha value to 255 (fully opaque) for all pixels
            new_data.append((item[0], item[1], item[2], 255))

        output.putdata(new_data)
        o.write(output)