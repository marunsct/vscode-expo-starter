import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import CustomSplitView from './CustomSplitView';
import EqualSplitView from './EqualSplitView';
import PartsSplitView from './PartsSplitView';
import PercentageSplitView from './PercentageSplitView';

type Friend = {
  id: string;
  userId?: number; // Optional userId for the friend
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  amount?: number; // Optional amount for the friend
  counter?: number; // Optional counter for the friend
};

interface ExpenseSplitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  setSplit: (split: 'equal' | 'parts' | 'percentage' | 'custom') => void;
  contributors: (Friend)[];
  setNewContributors: (paidBy: Friend[]) => void;
  setNewParticipants: (participants: Friend[]) => void;
  participants: (Friend)[];
  paidBy: Friend;
  amount: string;
  currency: string;
}

const ExpenseSplitModal: React.FC<ExpenseSplitModalProps> = ({
  visible,
  onClose,
  onSave,
  paidBy,
  amount,
  currency,
  contributors,
  participants,
  setNewContributors,
  setNewParticipants,
  setSplit
}) => {
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<Friend | null>(null);
  const [multipleMode, setMultipleMode] = useState(false);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [selectedSplit, setSelectedSplit] = useState<'equal' | 'parts' | 'percentage' | 'custom'>('equal');
  const [splitModalType, setSplitModalType] = useState<'equal' | 'parts' | 'percentage' | 'custom' | null>(null);
  // State for EqualSplitView selection
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>(participants);

  // Keep selectedFriends in sync with participants (e.g. when participants change)
  React.useEffect(() => {
    setSelectedFriends(participants);
  }, [participants]);

  // selectAll is true if all participants are selected
  const selectAll = selectedFriends.length === participants.length && participants.length > 0;

  const perUserAmount = selectedFriends.length > 0 ? (parseFloat(amount) / selectedFriends.length || 1).toFixed(2) : 0.00;

  const totalShares = selectedFriends.reduce((sum, f) => sum + (Number(f.counter) || 0), 0);
  const totalPercentage = selectedFriends.reduce((sum, f) => sum + (Number(f.counter) || 0), 0);
  const totalCustom = selectedFriends.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Sync selectedMultiple with contributors whenever multipleMode is enabled
  React.useEffect(() => {
    if (multipleMode) {
      setSelectedMultiple(contributors.map(c => c.id));
    }
  }, [multipleMode, contributors]);

  // Filter participants to exclude contributors
  const availableParticipants = participants.filter(
    (p) => !contributors.some((c) => c.id === p.id)
  );

  // Handler for opening the participant modal
  const handleContributorPress = (contributor: Friend) => {
    setSelectedContributor(contributor);
    setShowParticipantModal(true);
  };

  // Handler for selecting a participant (replace contributor)
  const handleSelectParticipant = (participant: Friend) => {
    if (selectedContributor) {
      const updated = contributors.map((c) =>
        c.id === selectedContributor.id ? participant : c
      );
      setNewContributors(updated);
      setShowParticipantModal(false);
      setSelectedContributor(null);
    }
  };

  // Handler for Paid by Multiple Members
  const handlePaidByMultiple = () => {
    setMultipleMode(true);
    // No need to setSelectedMultiple here, useEffect will handle it
  };

  // Handler for toggling selection in multiple mode
  const toggleSelectMultiple = (id: string) => {
    setSelectedMultiple((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Handler for saving multiple contributors
  const handleSaveMultiple = () => {
    const newContributors = participants.filter((p) => selectedMultiple.includes(p.id));
    setNewContributors(newContributors);
    setShowParticipantModal(false);
    setSelectedContributor(null);
    setMultipleMode(false);
    setSelectedMultiple([]);
  };

  // Calculate sum of contributor amounts
  const totalContributed = contributors.reduce(
    (sum, c) => sum + (typeof c.amount === 'number' ? c.amount : 0),
    0
  );
  const totalAmount = parseFloat(amount) || 0;
  const remainingAmount = totalAmount - totalContributed;
  const isOver = totalContributed > totalAmount;

  const handleSplitPress = (type: 'equal' | 'parts' | 'percentage' | 'custom') => {
    setSelectedSplit(type);
    setSplit(type);
    setSplitModalType(type);
  };

  // Handler for Select All button
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(participants);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.fullScreenOverlay}>
        <View style={styles.modalContent}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
              <Ionicons name="close" size={28} color="#222" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Expense Splits</Text>
            <TouchableOpacity onPress={onSave} style={styles.headerIcon}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={{ minHeight: '86%' }}>
            <View style={{  flexDirection: 'column', minHeight:'20%', maxHeight: '35%', marginBottom: 5 }}>
              {/* Paid by Title and Total */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, marginBottom: 5, marginHorizontal: 5 }}>
                <Text style={styles.sectionTitle}>Paid by :</Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isOver ? '#e53935' : '#888',
                    fontWeight: 'bold',
                  }}
                >
                  Left: {remainingAmount} of {amount}
                </Text>
              </View>
              {/* List Items for contributors */}
              <ScrollView style={{ marginBottom: 5 }}>
                {contributors.map((contributor, idx) => (
                  <View style={styles.listItem} key={contributor.id}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => handleContributorPress(contributor)}
                      activeOpacity={0.7}
                    >
                      {contributor.profile_image ? (
                        <Image source={{ uri: contributor.profile_image }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {contributor.first_name?.[0]?.toUpperCase() ?? contributor.username?.[0]?.toUpperCase() ?? '?'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.nameText}>
                        {contributor.first_name ?? contributor.username}
                      </Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 80 }}>
                      <Text style={styles.currencyText}>{currency}</Text>
                      <TextInput
                        style={{
                          borderBottomWidth: 1,
                          borderColor: '#ccc',
                          fontSize: 16,
                          minWidth: 80,
                          textAlign: 'right',
                          marginRight: 4,
                          padding: 0,
                          backgroundColor: 'transparent',
                        }}
                        keyboardType="numeric"
                        value={contributor.amount !== undefined ? String(contributor.amount) : ''}
                        onChangeText={(text) => {
                          const updated = contributors.map((c, i) =>
                            i === idx
                              ? { ...c, amount: text === '' ? undefined : Number(text.replace(/[^0-9.]/g, '')) }
                              : c
                          );
                          setNewContributors(updated);
                        }}
                        placeholder="0"
                      />

                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
            {/* Add Split type Buttons */}
            <View
              style={{
                borderBottomColor: '#eee',
                borderBottomWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 15,
                backgroundColor: 'rgba(237, 253, 253, 0.47)',
              }}
            >
              {[
                { type: 'equal', icon: 'reorder-four', label: 'Equal', color: '#2196F3' },
                { type: 'parts', icon: 'bar-chart', label: 'Shares', color: '#4CAF50' },
                { type: 'percentage', icon: 'pricetag', label: 'Percent', color: '#FF9800' },
                { type: 'custom', icon: 'options', label: 'Custom', color: '#9C27B0' },
              ].map(({ type, icon, label, color }) => {
                const isSelected = selectedSplit === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleSplitPress(type as any)}
                    style={{
                      alignItems: 'center',
                      padding: 2,
                      borderRadius: 10,
                      backgroundColor: isSelected ? color : 'transparent',
                      //borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? color : '#ddd',
                      minWidth: 55,
                    }}
                  >
                    <Ionicons
                      name={icon as any}
                      size={28}
                      color={isSelected ? '#fff' : color}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: isSelected ? '#fff' : color,
                        marginTop: 2,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ flex: 1 }}>
              {
                (selectedSplit === 'equal') &&
                (<EqualSplitView
                  participants={participants}
                  selectedIds={selectedFriends}
                  setSelectedIds={setSelectedFriends}
                />)
              }
              {
                (selectedSplit === 'parts') && (
                  <PartsSplitView participants={participants} setSelectedIds={setSelectedFriends} />
                )
              }
              {
                (selectedSplit === 'percentage') && (
                  <PercentageSplitView participants={participants} />
                )
              }
              {
                (selectedSplit === 'custom') && (
                  <CustomSplitView participants={participants} />
                )
              }
            </View>
          </View>
          {/* Footer Bar */}
          <View style={[styles.footerBar]}>

            <View style={{ flex: 1, maxWidth: 200, alignItems: 'baseline', justifyContent: 'center', marginLeft: 24, marginTop: 8 }}>
              <Text style={styles.footerText}>
                {selectedSplit === 'equal' && 'Expense : ' + perUserAmount + ' per User'}
                {selectedSplit === 'parts' && 'Total Shares : ' + totalShares}
                {selectedSplit === 'percentage' && ' ' + totalPercentage + '% of 100% Left'}
                {selectedSplit === 'custom' && 'Total Amount : ' + totalCustom}
              </Text>
            </View>
            {selectedSplit === 'equal' && (<TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
              <Ionicons name={selectAll ? 'checkbox' : 'square-outline'} size={22} color="#2196F3" />
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>)}

          </View>
        </View>

        {/* Participant Selection Modal */}
        <Modal visible={showParticipantModal} animationType="slide" transparent>
          <View style={styles.fullScreenOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => {
                  setShowParticipantModal(false);
                  setMultipleMode(false);
                  setSelectedMultiple([]);
                }} style={styles.headerIcon}>
                  <Ionicons name="close" size={28} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Paid By</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (multipleMode) {
                      handleSaveMultiple();
                    } else {
                      setShowParticipantModal(false);
                    }
                  }}
                  style={styles.headerIcon}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
              {/* List of available participants */}
              <FlatList
                data={multipleMode ? participants : availableParticipants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  // Exclude contributors if not in multiple mode
                  if (!multipleMode && contributors.some((c) => c.id === item.id)) return null;
                  return (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() =>
                        multipleMode
                          ? toggleSelectMultiple(item.id)
                          : handleSelectParticipant(item)
                      }
                    >
                      {item.profile_image ? (
                        <Image source={{ uri: item.profile_image }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {item.first_name?.[0]?.toUpperCase() ?? item.username?.[0]?.toUpperCase() ?? '?'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.nameText}>
                        {item.first_name ?? item.username}
                      </Text>
                      {multipleMode && (
                        <Ionicons
                          name={
                            selectedMultiple.includes(item.id)
                              ? 'checkbox'
                              : 'square-outline'
                          }
                          size={24}
                          color="#00796b"
                          style={{ marginLeft: 12 }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListFooterComponent={
                  !multipleMode ? (
                    <TouchableOpacity
                      style={[styles.listItem, { backgroundColor: '#e0f7fa' }]}
                      onPress={handlePaidByMultiple}
                    >
                      <Ionicons name="people" size={24} color="#00796b" style={{ marginRight: 12 }} />
                      <Text style={[styles.nameText, { color: '#00796b' }]}>Paid by Multiple Members</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#fff', // or 'rgba(0,0,0,0.15)' for a dim effect
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 40 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#222',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginLeft: 18,
    marginBottom: 10,
    color: '#222',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 6,
    marginBottom: 5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#00796b',
    fontSize: 18,
  },
  nameText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'normal',
  },
  amountText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'normal',
    marginRight: 5,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 8,
    zIndex: 100,
    minHeight: 70,

  },
  footerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  selectAllButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
    //borderWidth: 1,
    //borderColor: '#2196F3',
  },
  selectAllText: {
    marginLeft: 4,
    marginTop: 4,
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 10,
  },
});

export default ExpenseSplitModal;