from flask import Flask, Blueprint, jsonify, request, make_response
from flask_cors import CORS
import requests
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Explain how AI works")

app = Flask(__name__)

# Enable CORS globally with a wildcard (*) for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

etf_bp = Blueprint('etfs', __name__)

@etf_bp.route('/', methods=['GET'])
def get_etfs():
    # Add explicit CORS headers for demonstration purposes
    response = jsonify({'message': 'ETFs list endpoint'})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@etf_bp.route('/<string:symbol>', methods=['GET'])
def get_etf(symbol):
    # Add explicit CORS headers for demonstration purposes
    response = jsonify({'message': f'ETF details for {symbol}'})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@etf_bp.route('/search/<keyword>', methods=['GET', 'OPTIONS'])
def search_stocks(keyword):
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response, 204

    # Handle actual GET request
    try:
        external_response = requests.get(f'https://ticker-2e1ica8b9.now.sh/keyword/{keyword}')
        external_response.raise_for_status()
        response = jsonify(external_response.json())
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except requests.RequestException as e:
        error_response = jsonify({
            'error': str(e),
            'results': [],
            'message': 'Failed to fetch stock data'
        })
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        return error_response, 500

@etf_bp.route('/ask-dave', methods=['POST', 'OPTIONS'])
def ask_dave():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response, 204

    try:
        tickers = request.json.get('tickers', [])
        if not tickers:
            return jsonify({'error': 'No tickers provided'}), 400

        # Create the prompt for Gemini
        ticker_list = ', '.join([t['symbol'] for t in tickers])
        prompt = f"""Given these stock tickers: {ticker_list}, 
        suggest which 4 ETFs would be most suitable for investment. 
        Select the top 4 ETFs that have the most exposure to the given tickers. If 
        one ETF only has exposure to some tickers and not all, make sure to select
        another ETF in one of the four ETFs that has the most exposure to that given
        ticker. Please give me your answer in the following format for four ETFs. ETF Name, 
        ETF Exposure to the given tickers in percentages (Give a percent for each ticker), and ETF Risk Profile, 
        which will either be High Risk, Medium Risk, or Low Risk. Also provide a rating
        for High Diversification, Moderate Diversification, or Low Diversification. Please 
        don't include any other unnecessary words or phrases or information in your response.
        Just the ETF names, exposure percentages, risk profile, and diversification ratings. If 
        you are not sure about the exposure percentages, do not say moderate or low or highjust say 0%.
        For the exposure percentages, just give me a percentage for each ticker. No unnecessary words
        such as "Moderate" or "High" or "Low". Just give me the percentage for each ticker. Make
        sure each ticker has exposure to atleast one ETF that you recommend. Do not include
        unnecessary information such as "I am not a financial advisor" or "I am not a professional"
        or anything like that. Return the results to me like an actual JSON file like the following:     [
        {{
            "ETF Name": "Invesco QQQ Trust (QQQ)",
            "Percentages": ["TSLA: 3-5%", "MSFT: 3-5%", "AAPL: 3-5%"],
            "Risk Level": "High Risk",
            "Diversification Level": "Moderate Diversification"
        }},
        {{
            "ETF Name": "Technology Select Sector SPDR Fund (XLK)",
            "Percentages": ["TSLA: 0%", "MSFT: 5-7%", "AAPL: 5-7%"],
            "Risk Level": "Medium Risk",
            "Diversification Level": "Moderate Diversification"
        }},
        {{
            "ETF Name": "SPDR S&P 500 ETF Trust (SPY)",
            "Percentages": ["TSLA: 1-2%", "MSFT: 2-3%", "AAPL: 2-3%"],
            "Risk Level": "Low Risk",
            "Diversification Level": "High Diversification"
        }},
        {{
            "ETF Name": "ARK Innovation ETF (ARKK)",
            "Percentages": ["TSLA: 9-11%", "MSFT: 0%", "AAPL: 0%"],
            "Risk Level": "High Risk",
            "Diversification Level": "Low Diversification"
        }}
        ]"""

        # Get Gemini's response
        response = model.generate_content(prompt)
        
        return jsonify({
            'recommendation': response.text
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to get ETF recommendation'
        }), 500

app.register_blueprint(etf_bp, url_prefix='/etfs')

if __name__ == '__main__':
    app.run(port=5000)
