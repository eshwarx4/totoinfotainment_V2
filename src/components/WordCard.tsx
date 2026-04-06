import { Card, CardContent } from "@/components/ui/card";
import { WordItem } from "@/types/content";
import { AudioPlayer } from "./AudioPlayer";

interface WordCardProps {
  word: WordItem;
  onClick?: () => void;
  showTransliteration?: boolean;
}

export const WordCard = ({ word, onClick, showTransliteration = false }: WordCardProps) => {
  return (
    <Card 
      className="card-elevated cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <img
          src={word.imageUrl}
          alt={word.english}
          className="w-32 h-32 object-contain rounded-lg"
        />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-primary">{word.toto}</h3>
          {showTransliteration && word.transliteration && word.transliteration.trim() !== '' && (
            <p className="text-sm text-muted-foreground italic">({word.transliteration})</p>
          )}
          {word.toto !== word.english && (
            <p className="text-lg text-foreground">{word.english}</p>
          )}
        </div>
        <div className="flex gap-4">
          <AudioPlayer
            audioUrl={word.audioToto}
            label="Listen"
            variant="toto"
          />
          <AudioPlayer
            audioUrl={word.audioEnglish}
            label="Listen"
            variant="english"
          />
        </div>
      </CardContent>
    </Card>
  );
};
