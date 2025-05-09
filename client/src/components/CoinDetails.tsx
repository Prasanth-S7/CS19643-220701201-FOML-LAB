
//@ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CoinDetailsProps {
  selectedCoin: CoinType;
  priceData: any;
  prediction: PredictionDataType;
}

const CoinDetails = ({ selectedCoin, priceData, prediction }: CoinDetailsProps) => {
  const currentPrice = priceData[selectedCoin.symbol.toLowerCase()]?.usd || 0;
  const predictedPrice = prediction.next_day_prediction;
  const isPriceUp = predictedPrice > currentPrice;
  const changePercentage = isPriceUp 
    ? ((predictedPrice / currentPrice) * 100 - 100).toFixed(2)
    : (100 - (predictedPrice / currentPrice) * 100).toFixed(2);

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src="" alt={selectedCoin.name} />
          <AvatarFallback className="bg-muted text-lg">{selectedCoin.symbol.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{selectedCoin.name}</h2>
          <p className="text-muted-foreground">{selectedCoin.symbol}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Current Price</h3>
            <p className="text-3xl font-bold">${currentPrice.toLocaleString()}</p>
            <div className="flex items-center mt-2">
              <TrendingUp className="text-crypto-positive mr-1" />
              <span className="text-crypto-positive">+5.2% (24h)</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Next Day Prediction</h3>
            <p className="text-3xl font-bold">
              ${predictedPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center mt-2">
              {isPriceUp ? (
                <>
                  <TrendingUp className="text-crypto-positive mr-1" />
                  <span className="text-crypto-positive">+{changePercentage}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="text-crypto-negative mr-1" />
                  <span className="text-crypto-negative">-{changePercentage}%</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Future Predictions (Next 7 Days)</h3>
          <div className="flex overflow-x-auto pb-2">
            {prediction.predictions.map((price, index) => {
              const dayChange = index > 0 
                ? ((price / prediction.predictions[index - 1] - 1) * 100).toFixed(2) 
                : null;
              const isUp = index > 0 && price > prediction.predictions[index - 1];
              
              return (
                <div 
                  key={index} 
                  className="min-w-[120px] p-4 mr-4 border rounded-md text-center"
                >
                  <p className="text-sm font-medium">Day {index + 1}</p>
                  <p className="text-lg font-bold my-2">
                    ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  {dayChange !== null && (
                    <p className={isUp ? "text-crypto-positive text-xs" : "text-crypto-negative text-xs"}>
                      {isUp ? `+${dayChange}%` : `${dayChange}%`}
                    </p>
                  )}
                  {dayChange === null && <p className="text-xs">—</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Card>
  );
};

export default CoinDetails;