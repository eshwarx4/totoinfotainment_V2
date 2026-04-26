import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameProvider } from "@/state/GameContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AppShell from "@/components/layout/AppShell";

// Screens — Onboarding (no navbar)
import Welcome from "./screens/Welcome";
import ProfileSetup from "./screens/ProfileSetup";
import Tutorial from "./screens/Tutorial";

// Screens — Main tabs (with navbar)
import MapScreen from "./screens/MapScreen";
import LearnTab from "./screens/LearnTab";
import PlayTab from "./screens/PlayTab";
import LeaderboardTab from "./screens/LeaderboardTab";
import ChatbotTab from "./screens/ChatbotTab";
import ProfileTab from "./screens/ProfileTab";

// Screens — Learn sub-pages (with navbar)
import CategoryWords from "./screens/CategoryWords";
import ConceptViewer from "./screens/ConceptViewer";

// Screens — Sub-pages (with navbar)
import WorldScreen from "./screens/WorldScreen";
import ProgressScreen from "./screens/ProgressScreen";
import SettingsScreen from "./screens/SettingsScreen";

// Screens — Game flow (no navbar — fullscreen)
import LevelIntro from "./screens/LevelIntro";
import GameScreen from "./screens/GameScreen";
import LevelComplete from "./screens/LevelComplete";
import StoryScreen from "./screens/StoryScreen";
import CulturalReward from "./screens/CulturalReward";

// Screens — Play Zone games (fullscreen)
import PuzzleGame from "./components/play/puzzle/PuzzleGame";
import RunnerGame from "./components/play/runner/RunnerGame";
import TreasureHunt from "./components/play/treasure/TreasureHunt";
import BlockBuilder from "./components/play/blocks/BlockBuilder";
import WordFinder from "./components/play/wordfinder/WordFinder";
import QuickChallenge from "./components/play/challenge/QuickChallenge";
import MonkeyArrow from "./components/play/monkey/MonkeyArrow";
import SpellingLearner from "./components/play/spelling/SpellingLearner";
import WordSnake from "./components/play/snake/WordSnake";
import BoardQuest from "./components/play/board/BoardQuest";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Wrapper for screens that show the bottom navbar */
function WithNavbar({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

/** Wrapper for fullscreen screens (no navbar, but still in phone frame on desktop) */
function WithFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <GameProvider>
          <BrowserRouter>
            <Routes>
              {/* === Onboarding (no navbar) === */}
              <Route path="/" element={<WithFrame><Welcome /></WithFrame>} />
              <Route path="/profile" element={<WithFrame><ProfileSetup /></WithFrame>} />
              <Route path="/tutorial" element={<WithFrame><Tutorial /></WithFrame>} />

              {/* === Main tabs (with navbar) === */}
              <Route path="/map" element={<WithNavbar><MapScreen /></WithNavbar>} />
              <Route path="/learn" element={<WithNavbar><LearnTab /></WithNavbar>} />
              <Route path="/play" element={<WithNavbar><PlayTab /></WithNavbar>} />
              <Route path="/leaderboard" element={<WithNavbar><LeaderboardTab /></WithNavbar>} />
              <Route path="/chatbot" element={<WithNavbar><ChatbotTab /></WithNavbar>} />
              <Route path="/profile-tab" element={<WithNavbar><ProfileTab /></WithNavbar>} />

              {/* === Learn sub-pages (with navbar) === */}
              <Route path="/learn/category/:category" element={<WithNavbar><CategoryWords /></WithNavbar>} />
              <Route path="/learn/concept/:conceptId" element={<WithNavbar><ConceptViewer /></WithNavbar>} />

              {/* === Sub-pages (with navbar) === */}
              <Route path="/world/:worldId" element={<WithNavbar><WorldScreen /></WithNavbar>} />
              <Route path="/progress" element={<WithNavbar><ProgressScreen /></WithNavbar>} />
              <Route path="/settings" element={<WithNavbar><SettingsScreen /></WithNavbar>} />

              {/* === Game flow (phone frame, no navbar — fullscreen immersive) === */}
              <Route path="/level/:worldId/:levelNum/intro" element={<WithFrame><LevelIntro /></WithFrame>} />
              <Route path="/level/:worldId/:levelNum/game/:gameNum" element={<WithFrame><GameScreen /></WithFrame>} />
              <Route path="/level/:worldId/:levelNum/complete" element={<WithFrame><LevelComplete /></WithFrame>} />
              <Route path="/story/:worldId/:storyType" element={<WithFrame><StoryScreen /></WithFrame>} />
              <Route path="/cultural/:worldId" element={<WithFrame><CulturalReward /></WithFrame>} />

              {/* === Play Zone games (phone frame, fullscreen) === */}
              <Route path="/play/puzzle" element={<WithFrame><PuzzleGame /></WithFrame>} />
              <Route path="/play/runner" element={<WithFrame><RunnerGame /></WithFrame>} />
              <Route path="/play/treasure" element={<WithFrame><TreasureHunt /></WithFrame>} />
              <Route path="/play/blocks" element={<WithFrame><BlockBuilder /></WithFrame>} />
              <Route path="/play/wordfinder" element={<WithFrame><WordFinder /></WithFrame>} />
              <Route path="/play/challenge" element={<WithFrame><QuickChallenge /></WithFrame>} />
              <Route path="/play/monkey" element={<WithFrame><MonkeyArrow /></WithFrame>} />
              <Route path="/play/spelling" element={<WithFrame><SpellingLearner /></WithFrame>} />
              <Route path="/play/snake" element={<WithFrame><WordSnake /></WithFrame>} />
              <Route path="/play/board" element={<WithFrame><BoardQuest /></WithFrame>} />

              {/* === Legacy redirects === */}
              <Route path="/dashboard" element={<Navigate to="/map" replace />} />
              <Route path="/words" element={<Navigate to="/map" replace />} />
              <Route path="/stories" element={<Navigate to="/map" replace />} />
              <Route path="/quizzes" element={<Navigate to="/map" replace />} />
              <Route path="/games" element={<Navigate to="/map" replace />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
