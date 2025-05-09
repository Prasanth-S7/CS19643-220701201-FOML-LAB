
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface CoinCardProps {
  coin: any;
  onClick: () => void;
}

const CoinCard = ({ coin, onClick }: CoinCardProps) => {
  return (
    <Card 
      className="h-full cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src="" alt={coin.name} />
            <AvatarFallback className="bg-muted">{coin.symbol.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-medium">{coin.name}</h3>
            <p className="text-muted-foreground">{coin.symbol}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-sm text-muted-foreground">Click to view predictions</p>
      </CardContent>
    </Card>
  );
};

export default CoinCard;