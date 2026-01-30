import React, { useEffect, useRef } from 'react';
import { View, Image, ScrollView, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Onboard: undefined;
};

export const loaderHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .progress-loader {
        width: 150px;
        height: 3px;
        background: rgba(236, 236, 238, 0.253);
        border-radius: 7px;
        overflow: hidden;
      }

      .progress {
        width: 1px;
        height: 3px;
        border-radius: 7px;
        background: rgb(255, 255, 255);
        animation: loading1274 2s ease infinite;
      }

      @keyframes loading1274 {
        0% { width: 0%; }
        10% { width: 10%; }
        50% { width: 40%; }
        60% { width: 60%; }
        100% { width: 100%; }
      }
    </style>
  </head>

  <body>
    <div class="progress-loader">
      <div class="progress"></div>
    </div>
  </body>
</html>
`;

const Loader: React.FC = () => {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      try {
        nav.navigate('Onboard');
        console.log('nav!');
      } catch (err) {
        console.warn('replace failed', err);
        try {
          nav.navigate('Onboard');
        } catch (err2) {
          console.error('failed', err2);
        }
      }
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        console.log('[Loader] timer cleared on unmount');
      }
    };
  }, [nav]);

  return (
    <ImageBackground
      source={require('../../assets/images/goalfieldsldbg.png')}
      style={{ flex: 1, backgroundColor: '#151225' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: 650,
          }}
        >
          <Image source={require('../../assets/images/goalfieldldlogo.png')} />
        </View>

        <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center' }}>
          <WebView
            originWhitelist={['*']}
            source={{ html: loaderHTML }}
            style={{ width: 360, height: 10, backgroundColor: 'transparent' }}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Loader;
