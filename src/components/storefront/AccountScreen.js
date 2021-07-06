import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { EventRegister } from 'react-native-event-listeners';
import tailwind from '../../tailwind';
import Storefront, { Customer } from '@fleetbase/storefront';
import MMKVStorage from 'react-native-mmkv-storage';

const DataStore = new MMKVStorage.Loader().withInstanceID(getUniqueId()).initialize();

const StorefrontAccountScreen = ({ navigation, route }) => {
    const { info, key } = route.params;
    const storefront = new Storefront(key, { host: 'https://v2api.fleetbase.engineering' });
    const [customer, setCustomer] = useState(null);

    const getCustomer = () => {
        const attributes = DataStore.getMap('customer');

        console.log('getCustomer', attributes);

        if (attributes) {
            const _customer = new Customer(attributes);
            _customer.setAdapter(storefront.getAdapter());
            setCustomer(_customer);
        }
    };

    if (customer === null) {
        getCustomer();
    }

    useEffect(() => {
        // Listen for customer created event
        const customerCreatedListener = EventRegister.addEventListener('customer.created', (customer) => {
            setCustomer(customer);
        });

        return () => {
            // Remove cart.changed event listener
            EventRegister.removeEventListener(customerCreatedListener);
        };
    }, []);

    return (
        <View>
            <View style={tailwind('flex h-32 overflow-hidden')}>
                <ImageBackground source={{ uri: info.backdrop_url }} style={tailwind('flex-1 relative')} imageStyle={tailwind('bg-cover absolute -bottom-12')}>
                    <View style={tailwind('flex flex-row justify-between items-end w-full h-full p-2')}>
                        <View>
                            <View style={tailwind('rounded-full px-3 py-2 bg-gray-900')}>
                                <Text style={tailwind('text-white')}>{info.name}</Text>
                            </View>
                        </View>
                        <View></View>
                    </View>
                </ImageBackground>
            </View>
            {!customer && (
                <View style={tailwind('flex items-center w-full h-full py-20')}>
                    <Text style={tailwind('text-lg font-semibold mb-6')}>Create an account or login</Text>
                    <View style={tailwind('flex')}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={tailwind('mb-6')}>
                            <View style={tailwind('flex items-center justify-center rounded-md px-8 py-2 bg-white shadow-sm')}>
                                <Text style={tailwind('font-semibold text-blue-500 text-lg')}>Login</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                            <View style={tailwind('flex items-center justify-center rounded-md px-8 py-2 bg-white shadow-sm')}>
                                <Text style={tailwind('font-semibold text-green-500 text-lg')}>Create Account</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {customer && (
                <View style={tailwind('w-full h-full')}>
                    <View style={tailwind('p-4')}>
                        <View style={tailwind('flex flex-row')}>
                            <View style={tailwind('mr-4')}>
                                <Image source={{ uri: customer.getAttribute('photo_url') }} style={tailwind('w-12 h-12 rounded-full')} />
                            </View>
                            <View>
                                <Text style={tailwind('text-lg font-semibold')}>Hello, {customer.getAttribute('name')}</Text>
                                <Text style={tailwind('text-gray-500')}>{customer.getAttribute('phone')}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default StorefrontAccountScreen;