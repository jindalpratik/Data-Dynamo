import textwrap

import google.generativeai as genai

from IPython.display import display
from IPython.display import Markdown

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from rembg import remove
from PIL import Image
import io
import uvicorn
import json
import sqlite3

import os
# importing necessary functions from dotenv library
from dotenv import load_dotenv, dotenv_values
import logging
# loading variables from .env file
load_dotenv()

app = FastAPI()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

db = sqlite3.connect('database.sqlite')
c = db.cursor()

c.execute('''CREATE TABLE if not exists products 
          ( product_id TEXT PRIMARY KEY,
          item_name TEXT, product_type TEXT,
          description TEXT, brand_name TEXT,
          country TEXT, your_price REAL,
          quantity INTEGER, mrp REAL,
          fulfillment TEXT,
          manufacturer TEXT,
          contact_no TEXT)''')

db.commit()
db.close()


class Product(BaseModel):
    product_id: str
    item_name: str
    product_type: str
    description: str
    brand_name: str
    country: str
    your_price: float
    quantity: int
    mrp: float
    fulfillment: str
    manufacturer: str
    contact_no: str


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
        new_data = [(255, 255, 255, 255) if item[3]
                    == 0 else item for item in data]
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

    response = model.generate_content(
        ["""Provide an amazon listing and provide the response in the follwing json format {"Item Name":"","Product type":"","Description":"" }""", img], stream=True)
    response.resolve()
    return convert_gemini_output_to_json(response.text)

@app.put("/update_product/{product_id}")
async def update_product(product_id: str, product: Product):
    conn = sqlite3.connect('database.sqlite')
    c = conn.cursor()

    c.execute('''
        UPDATE products SET
            item_name = ?,
            product_type = ?,
            description = ?,
            brand_name = ?,
            country = ?,
            your_price = ?,
            quantity = ?,
            mrp = ?,
            fulfillment = ?,
            manufacturer = ?,
            contact_no = ?
        WHERE product_id = ?
    ''', (product.item_name, product.product_type, product.description, product.brand_name, product.country, product.your_price, product.quantity, product.mrp, product.fulfillment, product.manufacturer, product.contact_no, product_id))

    if c.rowcount == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    conn.commit()
    conn.close()

    return {"message": "Product updated successfully"}

@app.post("/add_product")
async def add_product(product: Product):
    conn = sqlite3.connect('database.sqlite')
    c = conn.cursor()

    c.execute('''
        INSERT INTO products (
            product_id,
            item_name,
            product_type,
            description,
            brand_name,
            country,
            your_price,
            quantity,
            mrp,
            fulfillment,
            manufacturer,
            contact_no
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (product.product_id, product.item_name, product.product_type, product.description, product.brand_name, product.country, product.your_price, product.quantity, product.mrp, product.fulfillment, product.manufacturer, product.contact_no))

    conn.commit()
    conn.close()

    return {"message": "Product added successfully"}

@app.get("/search_products/{query}")
async def search_product(query: str):
    conn = sqlite3.connect('database.sqlite')
    c = conn.cursor()

    c.execute('''
    SELECT * FROM products WHERE product_id LIKE ? OR item_name LIKE ?
''', ('%' + query + '%', '%' + query + '%'))

# Fetch all products that match the search query
    products = c.fetchall() 

    conn.close()

    if not products:
        raise HTTPException(status_code=404, detail="Product not found")

    # Map the product details to the desired format
    product_details = [
        {
            "Product Id": product[0],
            "Item Name": product[1],
            "Product type": product[2],
            "Description": product[3],
            "Brand Name": product[4],
            "Country": product[5],
            "Your Price": product[6],
            "Quantity": product[7],
            "M.R.P": product[8],
            "FullFillment": product[9],
            "Manufacturer": product[10],
            "Contact No.": product[11]
        }
        for product in products
    ]

    return {"products": product_details}

@app.get("/search_product/{query}")
async def search_product(query: str):
    conn = sqlite3.connect('database.sqlite')
    c = conn.cursor()

    c.execute('''
    SELECT * FROM products WHERE product_id = ?
    ''', (query))

# Fetch all products that match the search query
    product = c.fetchone() 

    conn.close()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Map the product details to the desired format
    product_details = [
        {
            "Product Id": product[0],
            "Item Name": product[1],
            "Product type": product[2],
            "Description": product[3],
            "Brand Name": product[4],
            "Country": product[5],
            "Your Price": product[6],
            "Quantity": product[7],
            "M.R.P": product[8],
            "FullFillment": product[9],
            "Manufacturer": product[10],
            "Contact No.": product[11]
        }
    ]

    return {"product": product_details}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    uvicorn.run("main:app", host="0.0.0.0", port=9080, reload=True)
