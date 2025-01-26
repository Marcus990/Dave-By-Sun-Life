class ETF:
    def __init__(self, symbol, name):
        self.symbol = symbol
        self.name = name

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'name': self.name
        } 