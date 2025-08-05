import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  List,
  Switch,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Settings</Title>
          <Paragraph>Configure your app preferences</Paragraph>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Push Notifications"
          description="Receive notifications for delivery updates"
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Location</List.Subheader>
        <List.Item
          title="Location Services"
          description="Allow app to access your location"
          right={() => (
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Profile"
          description="Edit your profile information"
          left={props => <List.Icon {...props} icon="account" />}
          onPress={() => navigation.navigate('Profile' as never)}
        />
        <List.Item
          title="Change Password"
          description="Update your password"
          left={props => <List.Icon {...props} icon="lock" />}
          onPress={() => {
            // TODO: Navigate to change password screen
          }}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Support</List.Subheader>
        <List.Item
          title="Help & Support"
          description="Get help with the app"
          left={props => <List.Icon {...props} icon="help-circle" />}
          onPress={() => {
            // TODO: Navigate to help screen
          }}
        />
        <List.Item
          title="About"
          description="App version and information"
          left={props => <List.Icon {...props} icon="information" />}
          onPress={() => {
            // TODO: Navigate to about screen
          }}
        />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#f44336"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    marginVertical: 8,
  },
});

export default SettingsScreen;
