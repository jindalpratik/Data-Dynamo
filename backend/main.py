import textwrap

import google.generativeai as genai

from IPython.display import display
from IPython.display import Markdown

from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from rembg import remove
from PIL import Image
import io
import uvicorn
import json

import os
# importing necessary functions from dotenv library
from dotenv import load_dotenv, dotenv_values 
import logging
# loading variables from .env file
load_dotenv()

app = FastAPI()

GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))

def convert_gemini_output_to_json(gemini_output):
    # Find the start and end of the JSON part of the string
    start = gemini_output.find('{')
    end = gemini_output.rfind('}') + 1

    # Extract the JSON part of the string
    json_string = gemini_output[start:end]

    # Parse the JSON string into a Python dictionary
    return json.loads(json_string)

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


@app.post("/generate_blog_post")
async def generate_blog_post(image: UploadFile = File(...)):
    img = Image.open(image.file)

    model = genai.GenerativeModel('gemini-pro-vision')

    response = model.generate_content(["""Provide an amazon listing and provide the response in the follwing json format {"Item Name":"","Product type":"","Description":"" }""", img], stream=True)
    response.resolve()
    return convert_gemini_output_to_json(response.text)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    uvicorn.run("main:app", host="0.0.0.0", port=9080, reload=True)