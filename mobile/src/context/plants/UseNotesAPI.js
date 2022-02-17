import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';

import api from '../../utils/API';

const NotesContext = createContext({});

export const NotesProvider = ({ children }) => {
  const { t } = useTranslation();

  const getNotes = async (plantID) => {
    try {
      const res = await api.get('/notes', {
        params: {
          plantID,
        },
      });
      return res.data;
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const updateNote = async (note) => {
    try {
      const res = await api.put(`/notes/${note.id}`, note);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const createNote = async (note) => {
    try {
      const res = await api.post('/notes', note);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await api.delete(`/notes/${id}`);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      const { message } = error.response.data;

      console.log(error);
      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  return (
    <NotesContext.Provider
      value={{
        getNotes,
        updateNote,
        createNote,
        deleteNote,
      }}>
      {children}
    </NotesContext.Provider>
  );
};

NotesProvider.propTypes = {
  children: PropTypes.element,
};

export default function useNotesAPI() {
  return useContext(NotesContext);
}
