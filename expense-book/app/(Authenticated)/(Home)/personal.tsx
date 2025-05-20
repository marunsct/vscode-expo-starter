import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Personal() {
  const user = useSelector((state: any) => state.context.user)
  const dispatch = useDispatch()
  return (
    <View style={styles.container}>
      <Text>Personal Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});