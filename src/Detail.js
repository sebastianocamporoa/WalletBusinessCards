import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import firestore from "@react-native-firebase/firestore";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

export default function Detail({ route, navigation }) {
    const screenWidth = Dimensions.get('window').width;
    const { uid } = route.params;

    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [title, setTitle] = useState("");
    const [photo, setPhoto] = useState(null);
    const [step, setStep] = useState(1); // Controla los pasos (1: Bienvenida, 2: Solicitar Nombre)

    const saveDetails = async () => {
        try {
            await firestore().collection("users").doc(uid).set({
                name,
                company,
                title,
                photo
            });

            // Después de guardar, navegar al Dashboard
            navigation.navigate("Dashboard");
        } catch (error) {
            console.log("Error saving details: ", error);
        }
    };

    // Función para seleccionar la foto
    const pickImage = async () => {
        // Solicitar permiso para acceder a la galería
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Se requieren permisos para acceder a tu galería.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setPhoto(result.uri); // Guarda la URI de la foto seleccionada
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Paso 1: Pantalla de Bienvenida */}
                {step === 1 && (
                    <View style={styles.paragraphContainer}>
                        <Text style={styles.paragraph}>
                            ¡Estamos encantados de darte la bienvenida a Hi! Comencemos creando tu primera tarjeta de presentación digital.
                        </Text>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.customButton} onPress={() => setStep(2)}>
                                <Text style={styles.buttonText}>Haz mi primera tarjeta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Paso 2: Solicitar Nombre */}
                {step === 2 && (
                    <View style={styles.paragraphContainer}>
                        <Text style={styles.paragraph}>
                            Primero, cuéntanos un poco sobre ti. ¿Cuál es tu nombre?
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tu nombre"
                            value={name}
                            onChangeText={setName}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.customButton}
                                //onPress={saveDetails} // Guardar detalles cuando presionan continuar
                                onPress={() => setStep(3)}
                            >
                                <Text style={styles.buttonText}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {/* Paso 3: Solicitar Empresa y Cargo */}
                {step === 3 && (
                    <View style={styles.paragraphContainer}>
                        <Text style={styles.paragraph}>
                            ¡Es un placer conocerte! ¿Qué empresa y cargo deberían aparecer en tu primera tarjeta?
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la empresa"
                            value={company}
                            onChangeText={setCompany}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Tu título o cargo"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.customButton}
                                onPress={() => setStep(4)}
                            >
                                <Text style={styles.buttonText}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Paso 4: Subir Foto */}
                {step === 4 && (
                    <View style={styles.paragraphContainer}>
                        <Text style={styles.paragraph}>
                            Es hora de destacar tu tarjeta. ¡Es el momento de agregar una foto tuya!
                        </Text>

                        {/* Mostrar la imagen seleccionada si existe */}
                        {photo && (
                            <Image source={{ uri: photo }} style={styles.imagePreview} />
                        )}

                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                            <Text style={styles.buttonText}>Subir foto +</Text>
                        </TouchableOpacity>

                        <Text style={styles.tips}>
                            Consejos para la foto:
                            {"\n"}- Foto montajes de alta calidad tienden a verse mejor!
                            {"\n"}- Puede escoger distintas fotos para cada tarjeta.
                            {"\n"}- Siempre puede cambiar la foto más tarde.
                        </Text>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.customButton}
                                //onPress={saveDetails} // Guardar detalles cuando presionan continuar
                                onPress={() => setStep(5)}
                            >
                                <Text style={styles.buttonText}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    paragraphContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paragraph: {
        fontSize: 22,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        width: '80%',
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
    },
    footer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 20,
    },
    customButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eeeeee',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
