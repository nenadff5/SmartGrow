import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const NotesCard = ({ note, onDelete }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text>{note.text}</Text>
      <View style={styles.rightSideIconsWrapper}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={25}
          color="gray"
          style={{ margin: 5 }}
          onPress={() => {
            onDelete(note);
          }}
        />
      </View>
    </View>
  );
};

export default NotesCard;

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
  },
  rightSideIconsWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
