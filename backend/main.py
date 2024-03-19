from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from rembg import remove
from PIL import Image
import io
import uvicorn

app = FastAPI()

# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def remove_background_task(image_file):
    input = image_file.read()
    output = remove(input)

    with Image.open(io.BytesIO(output)) as img:
        img = img.convert("RGBA")
        data = img.getdata()
        new_data = [(255, 255, 255, 255) if item[3] == 0 else item for item in data]
        img.putdata(new_data)

        img_byte_array = io.BytesIO()
        img.save(img_byte_array, format="PNG")
        img_byte_array.seek(0)
        return img_byte_array.getvalue()  # Return processed image data

@app.post("/remove_background")
async def remove_background(image: UploadFile = File(...)):
    processed_image_data = remove_background_task(image.file)
    return StreamingResponse(io.BytesIO(processed_image_data), media_type="image/png")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9080)