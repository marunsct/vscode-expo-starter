import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

// import the Theme type or interface with the correct name, or define it locally if not exported
// Define the Theme interface locally if not exported elsewhere
interface Theme {
    colors: {
        primary: string;
        textPrimary: string;
        background: string; // added for calendar popover background
    };
}

interface DatePickerProps {
    date: Date;
    onDateChange: (newDate: Date) => void;
    theme: Theme;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({ date, onDateChange, theme }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [containerLayout, setContainerLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const openPicker = () => {
        setShowPicker(true);
    };

    const formatDate = (dateToFormat: Date): string => {
        const today = new Date();
        if (
            dateToFormat.getFullYear() === today.getFullYear() &&
            dateToFormat.getMonth() === today.getMonth() &&
            dateToFormat.getDate() === today.getDate()
        ) {
            return 'Today';
        }
        return dateToFormat.toLocaleString('default', { month: 'short', day: '2-digit' });
    };

    return (
        <View style={styles.wrapper} onLayout={({ nativeEvent }) => setContainerLayout(nativeEvent.layout)}>
            <TouchableOpacity onPress={openPicker} style={styles.container}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>
                    {formatDate(date)}
                </Text>
            </TouchableOpacity>
            {showPicker && containerLayout && (
                <>
                    <TouchableOpacity style={styles.backdrop} onPress={() => setShowPicker(false)} />
                    <View
                        style={[
                            styles.calendarContainer,
                            {
                                backgroundColor: theme.colors.background,
                                position: 'absolute',
                                top: -300, // float above the icon (calendar height ~320)
                                left: 0,
                                width: Math.max(containerLayout.width, 280), // set min width for calendar
                            },
                        ]}
                    >
                        <Calendar
                            current={date.toISOString().split('T')[0]}
                            onDayPress={(day) => {
                                setShowPicker(false);
                                onDateChange(new Date(day.dateString));
                            }}
                            theme={{
                                todayTextColor: theme.colors.primary,
                                arrowColor: theme.colors.primary,
                            }}
                        />
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8, // Added padding for better touch area
    },
    dateText: {
        marginLeft: 8,
        fontWeight: 'bold',
        fontSize: 16,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    calendarContainer: {
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});

export default DatePickerComponent;