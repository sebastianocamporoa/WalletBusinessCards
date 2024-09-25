import React, { useState } from "react";
import { isValidNumber } from 'libphonenumber-js';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, Dimensions, LogBox } from "react-native";
import { CountryPicker } from 'react-native-country-codes-picker'; // Nuevo picker
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

//LogBox.ignoreLogs(['Warning: CountryModal']);

export default function Login() {
    const screenWidth = Dimensions.get('window').width;
    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");
    const [confirm, setConfirm] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [countryCode, setCountryCode] = useState('PE'); // Código de país seleccionado
    const [callingCode, setCallingCode] = useState('+51'); // Código inicial
    const [showTooltip, setShowTooltip] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false); // Control del modal del picker
    const [countryFlag, setCountryFlag] = useState('🇵🇪'); // Bandera del país seleccionado
    const navigation = useNavigation();

    const confirmCode = async () => {
        try {
            const userCredential = await confirm.confirm(code);
            const user = userCredential.user;

            // Valida si el usuario es nuevo o existe
            const userDocument = await firestore()
                .collection("users")
                .doc(user.uid)
                .get();

            if (userDocument.exists) {
                navigation.navigate("Dashboard");
            } else {
                navigation.navigate("Detail", { uid: user.uid });
            }
        } catch (error) {
            console.log("Invalid code: ", error);
        }
    }

    const validatePhoneNumber = async () => {
        try {
            const fullNumber = `${callingCode}${phoneNumber}`;
            if (isValidNumber(fullNumber, countryCode)) {
                setShowTooltip(false);
                const confirmation = await auth().signInWithPhoneNumber(fullNumber);
                setConfirm(confirmation);
            } else {
                setShowTooltip(true);
            }
        } catch (error) {
            console.log("Error sending code: ", error);
        }
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Título */}
                <View style={styles.header}>
                    <Text style={styles.title}>👋Hey!</Text>
                    <Text style={styles.paragraph}>Obtén tu Tarjeta de Presentación Digital aquí!</Text>
                </View>

                {/* Imagen */}
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/login-image.png')}
                        style={[styles.image, { width: screenWidth }]}
                        resizeMode="contain"
                    />
                </View>

                {/* Métodos de Inicio de Sesión */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.customButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.buttonText}>📱 continuar con número de teléfono</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal para ingreso del número de teléfono */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <PanGestureHandler onGestureEvent={(event) => event.nativeEvent.translationY > 50 && setModalVisible(false)}>
                        <View style={styles.modalView}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setPhoneNumber("");
                                }}
                            >
                                <Text style={styles.closeButtonText}>✖</Text>
                            </TouchableOpacity>
                            {!confirm ? (
                                <>
                                    <Text style={styles.modalText}>Ingresa tu número de teléfono</Text>
                                    <View style={styles.phoneInputContainer}>
                                        <TouchableOpacity onPress={() => setShowCountryPicker(true)} style={styles.flagContainer}>
                                            <Text style={styles.flagText}>{countryFlag} {callingCode}</Text>
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.phoneInput}
                                            placeholder="Número de teléfono"
                                            keyboardType="phone-pad"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            color="white"
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.customButton} onPress={validatePhoneNumber}>
                                        <Text style={styles.buttonText}>Enviar código</Text>
                                    </TouchableOpacity>
                                    {showTooltip && (
                                        <View style={styles.tooltip}>
                                            <Text style={styles.tooltipText}>Número de teléfono inválido para {countryCode}</Text>
                                        </View>
                                    )}

                                    {/* Picker de país */}
                                    <CountryPicker
                                        show={showCountryPicker}
                                        pickerButtonOnPress={(item) => {
                                            setCountryCode(item.code); // Código de país ISO
                                            setCallingCode(item.dial_code); // Código de llamada (+57, +51, etc.)
                                            setCountryFlag(item.flag);
                                            setShowCountryPicker(false);
                                        }}
                                        onBackdropPress={() => setShowCountryPicker(false)}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.modalText}>
                                        Ingresa el código enviado a tu teléfono:
                                    </Text>
                                    <TextInput
                                        style={styles.textConfirm}
                                        placeholder="Enter code"
                                        value={code}
                                        onChangeText={setCode}
                                    />
                                    <TouchableOpacity
                                        onPress={confirmCode}
                                        style={styles.customButton}
                                    >
                                        <Text style={styles.buttonText}>
                                            Confirmar código
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </PanGestureHandler>
                </Modal>
            </View>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40
    },
    title: {
        fontSize: 50,
        fontWeight: 'bold'
    },
    paragraph: {
        fontSize: 22,
        textAlign: 'center',
    },
    imageContainer: {
        flex: 6,
        width: '100%',
    },
    image: {
        height: '100%',
        width: '100%',
    },
    footer: {
        flex: 2,
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
    },
    customButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eeeeee',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10,
        height: 25
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalText: {
        fontSize: 24,
        color: 'white',
        marginBottom: 10
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    closeButtonText: {
        fontSize: 30,
        color: 'white',
    },
    countryPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
    },
    callingCode: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
    },
    input: {
        height: 50,
        width: "100%",
        borderColor: "white",
        color: "white",
        borderWidth: 1,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    phoneInput: {
        color: 'white',
        marginLeft: 10,
        fontSize: 19,
        height: 25
    },
    tooltip: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        bottom: 100,
        left: '10%',
        right: '10%',
        alignItems: 'center',
    },
    tooltipText: {
        color: 'white',
        fontSize: 16,
    },
    textConfirm: {
        height: 40,
        width: "50%",
        borderColor: "white",
        color: "white",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 0.5,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    flagText: {
        fontSize: 22,
        color: 'white',
    }
});