import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { createRoom, joinRoom } from '../hooks/useSocket';
import RoomLobby from '../components/RoomLobby';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const { t } = useTranslation();
  const {
    playerName,
    setPlayerName,
    setError,
    error,
    gameHistory,
  } = useGameStore();

  const handleCreate = () => {
    if (!playerName.trim()) {
      setError(t('please_enter_name'));
      return;
    }
    setError('');
    createRoom(playerName.trim());
  };

  const handleJoin = (code: string) => {
    if (!playerName.trim()) {
      setError(t('please_enter_name'));
      return;
    }
    setError('');
    joinRoom(code, playerName.trim());
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RoomLobby
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onCreateRoom={handleCreate}
        onJoinRoom={handleJoin}
        error={error}
        history={gameHistory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
