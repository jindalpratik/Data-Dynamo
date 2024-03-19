import pathlib
import textwrap

import google.generativeai as genai

from IPython.display import display
from IPython.display import Markdown
import PIL.Image


# importing os module for environment variables
import os
# importing necessary functions from dotenv library
from dotenv import load_dotenv, dotenv_values 
# loading variables from .env file
load_dotenv()
 
# accessing and printing value
GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")

def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))

genai.configure(api_key=GOOGLE_API_KEY)

img = PIL.Image.open(r".\output_CjnS0vNTsVis_0.png")

model = genai.GenerativeModel('gemini-pro-vision')

response = model.generate_content(["Write a short, engaging blog post based on this picture.", img], stream=True)
response.resolve()
print(response.text)




