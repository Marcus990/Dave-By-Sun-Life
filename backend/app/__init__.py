from flask import Flask
from flask_cors import CORS
from app.config.mongodb import init_db
from app.routes.etf_routes import etf_bp

def create_app():
    app = Flask(__name__)
    
    # Enable CORS with specific origins
    CORS(app, resources={
        r"/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept"]
        }
    })

    # Initialize MongoDB
    init_db(app)

    # Register blueprints
    app.register_blueprint(etf_bp, url_prefix='/etfs')

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}

    return app 