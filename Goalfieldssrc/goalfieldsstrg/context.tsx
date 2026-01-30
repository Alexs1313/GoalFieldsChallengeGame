import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import Sound from 'react-native-sound';

type StoreContextValue = {
  isEnabledVibration: boolean;
  setIsEnabledVibration: React.Dispatch<React.SetStateAction<boolean>>;

  isEnabledSound: boolean;
  setIsEnabledSound: React.Dispatch<React.SetStateAction<boolean>>;

  isEnabledNotifications: boolean;
  setIsEnabledNotifications: React.Dispatch<React.SetStateAction<boolean>>;

  winClick: () => void;
  loseClick: () => void;
};

export const StoreContext = createContext<StoreContextValue | undefined>(
  undefined,
);

export const useStore = (): StoreContextValue => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within ContextProvider');
  }
  return ctx;
};

export const ContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isEnabledVibration, setIsEnabledVibration] = useState<boolean>(false);
  const [isEnabledSound, setIsEnabledSound] = useState<boolean>(false);
  const [isEnabledNotifications, setIsEnabledNotifications] =
    useState<boolean>(false);

  const winClick = () => {
    const clickSound = new Sound(
      'firework_single-83058.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
        clickSound.play(success => {
          if (!success) console.log('Sound playback failed');
          clickSound.release();
        });
      },
    );
  };

  const loseClick = () => {
    const clickSound = new Sound(
      'balloon-pop-48030.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
        clickSound.play(success => {
          if (!success) console.log('Sound playback failed');
          clickSound.release();
        });
      },
    );
  };

  const value = useMemo<StoreContextValue>(
    () => ({
      isEnabledVibration,
      setIsEnabledVibration,
      isEnabledSound,
      setIsEnabledSound,
      isEnabledNotifications,
      setIsEnabledNotifications,
      winClick,
      loseClick,
    }),
    [isEnabledVibration, isEnabledSound, isEnabledNotifications],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};
