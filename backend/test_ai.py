import google.generativeai as genai

# ⚠️ PASTE YOUR ACTUAL API KEY HERE
genai.configure(api_key="Insert your api key here")

print("Fetching available AI models for your key...")

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)