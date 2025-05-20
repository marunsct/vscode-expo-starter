import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyPickerProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  showCurrencyModal: boolean;
  setShowCurrencyModal: (b: boolean) => void;
  amountRef: React.RefObject<any>;
  currencyList: Currency[];
  theme: any;
}

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  currency,
  setCurrency,
  showCurrencyModal,
  setShowCurrencyModal,
  amountRef,
  currencyList,
  theme,
}) => (
  <>
    <TouchableOpacity style={{ marginRight: 8, padding: 8, borderRadius: 8, backgroundColor: '#e0e0e0' }} onPress={() => setShowCurrencyModal(true)}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{currency.symbol}</Text>
    </TouchableOpacity>
    <Modal visible={showCurrencyModal} transparent animationType="fade">
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowCurrencyModal(false)}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, width: 280, maxHeight: 400 }}>
          <FlatList
            data={currencyList}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {
                setCurrency(item);
                setShowCurrencyModal(false);
                setTimeout(() => amountRef.current?.focus(), 100);
              }}>
                <Text style={{ fontSize: 18 }}>{item.symbol} {item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  </>
);

export default CurrencyPicker;
