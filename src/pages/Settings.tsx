import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Type, Contrast, Trash2, Info, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useCoins } from "@/contexts/CoinContext";

export default function Settings() {
  const navigate = useNavigate();
  const { resetV2Data } = useCoins();
  const [showTransliteration, setShowTransliteration] = useState(
    localStorage.getItem('showTransliteration') !== 'false'
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem('notifications') === 'true'
  );
  const [largeText, setLargeText] = useState(
    localStorage.getItem('largeText') === 'true'
  );
  const [highContrast, setHighContrast] = useState(
    localStorage.getItem('highContrast') === 'true'
  );

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, value.toString());
  };

  const clearCache = () => {
    if (confirm('Are you sure you want to clear all cached content?')) {
      localStorage.removeItem('learnedWords');
      localStorage.removeItem('totalStars');
      localStorage.removeItem('streak');
      alert('Cache cleared successfully');
    }
  };

  const handleV2Reset = () => {
    if (confirm('This will reset ALL your V2 progress including coins, unlocked zones, and game stats. Are you sure?')) {
      resetV2Data();
      alert('V2 data reset successfully');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your learning experience</p>
      </div>

      <div className="space-y-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-base">
                Word of the Day reminders
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={(value) =>
                  handleToggle('notifications', value, setNotifications)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Language & Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="transliteration" className="text-base">
                Show Toto transliteration
              </Label>
              <Switch
                id="transliteration"
                checked={showTransliteration}
                onCheckedChange={(value) =>
                  handleToggle('showTransliteration', value, setShowTransliteration)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contrast className="h-5 w-5" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="largeText" className="text-base">
                Large text mode
              </Label>
              <Switch
                id="largeText"
                checked={largeText}
                onCheckedChange={(value) =>
                  handleToggle('largeText', value, setLargeText)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="highContrast" className="text-base">
                High contrast mode
              </Label>
              <Switch
                id="highContrast"
                checked={highContrast}
                onCheckedChange={(value) =>
                  handleToggle('highContrast', value, setHighContrast)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Reset all V2 progress (coins, zones, games)
              </p>
              <Button variant="destructive" onClick={handleV2Reset} className="w-full gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset V2 Data
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Clear legacy cached content
              </p>
              <Button variant="outline" onClick={clearCache} className="w-full">
                Clear Legacy Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About Toto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Learn more about the Toto language and culture
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/about')}
              className="w-full"
            >
              About Toto Language
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
