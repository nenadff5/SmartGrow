import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Modal,
  StyleSheet,
  Pressable,
  Dimensions,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import useNotesAPI from '../../../../context/plants/UseNotesAPI';
import { commonStyles } from '../../../../assets/styles/CommonStyles';
import LoadingScreen from '../../../../components/LoadingIndicator/LoadingIndicator';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import CustomPlaceholder from '../../../../components/CustomPlaceholder';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import NotesCard from './NotesCard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const NotesListScreen = (props) => {
  const plant = props.route.params?.plant;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { getNotes, createNote, deleteNote } = useNotesAPI();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);

  const NoteSchema = Yup.object().shape({
    text: Yup.string().required(t('plants.notes.form.text.required', { ns: 'app' })),
    plantId: Yup.string().required(t('plants.notes.form.plantId', { ns: 'app' })),
  });

  useEffect(async () => {
    await loadNotes();
    setLoading(false);
  }, [plant]);

  const loadNotes = async () => {
    const notes = await getNotes(plant.id);
    setNotes(notes);
  };

  const onNotesAddBtnClick = () => {
    setModalVisible(!modalVisible);
  };

  const onNoteDelete = async (note) => {
    console.log(note);
    await deleteNote(note.id);
    loadNotes();
  };

  const onModalClose = () => {
    setModalVisible(!modalVisible);
  };

  const onSubmit = (values) => {
    createNote({ text: values.text, plantId: values.plantId });
    loadNotes();
    onModalClose();
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <SafeAreaView style={commonStyles.keyboardAwareScrollViewWrapper}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(contentWidth, contentHeight) => {
          const viewHeight = contentHeight + 140;

          viewHeight > height ? setScrollEnabled(true) : setScrollEnabled(false);
        }}
        enableOnAndroid
        contentContainerStyle={commonStyles.paddedListContainer}
        showsVerticalScrollIndicator={false}>
        {notes?.length > 0 ? (
          notes.map((value, index) => {
            return <NotesCard key={index} note={value} onDelete={onNoteDelete} />;
          })
        ) : (
          <View>
            <Text style={{ marginTop: 20, textAlign: 'center', width: width * 0.8 }}>
              {t('plants.notes.noNotes', { ns: 'app' })}
            </Text>
          </View>
        )}
        <View style={commonStyles.footerContainer}>
          <CustomButton text="plants.notes.btnNewNote" onPress={onNotesAddBtnClick} />
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={onModalClose}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.centeredView}
          extraScrollHeight={125}  
          scrollEnabled={false}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{t('plants.notes.modal.title', { ns: 'app' })}</Text>

            <Formik
              contentContainerStyle={styles.container}
              validateOnMount
              initialValues={{ text: '', plantId: plant.id }}
              validationSchema={NoteSchema}
              onSubmit={onSubmit}>
              {({ handleChange, handleSubmit, handleBlur, values, errors, touched, isValid }) => (
                <View>
                  <View style={commonStyles.formContainer}>
                    <CustomInput
                      label="plants.notes.form.text.label"
                      iconName="note-outline"
                      style={commonStyles.inputField}
                      name="text"
                      onChangeText={handleChange('text')}
                      onBlur={handleBlur('text')}
                      value={values.text}
                      placeholder={t('plants.notes.form.text.placeholder', { ns: 'app' })}
                    />
                    {errors.text && touched.text ? (
                      <Text style={commonStyles.inputFieldError}>{errors.text}</Text>
                    ) : null}
                  </View>

                  <View style={styles.modalButton}>
                    <CustomButton
                      text="plants.notes.btnNewNote"
                      btnColor={!isValid ? 'grey' : null}
                      disabled={!isValid}
                      onPress={handleSubmit}
                    />
                  </View>
                </View>
              )}
            </Formik>

            <Pressable style={{ width: '100%' }} onPress={onModalClose}>
              <Text style={styles.textStyle}>
                {t('plants.notifications.closeModal', { ns: 'app' })}
              </Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </Modal>
    </SafeAreaView>
  );
};

export default NotesListScreen;

const { width, height } = Dimensions.get('screen');

const styles = StyleSheet.create({
  modalButton: {
    width: width * 0.8,
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonContainer: {
    width: width * 0.9,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 18,
  },
});
