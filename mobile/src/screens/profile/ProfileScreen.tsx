import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Avatar,
  Button,
  Card,
  Title,
  Paragraph,
  List,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

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
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={`${user?.first_name?.[0] || 'U'}${
              user?.last_name?.[0] || ''
            }`}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Title>{`${user?.first_name || 'User'} ${
              user?.last_name || ''
            }`}</Title>
            <Paragraph>{user?.email || 'user@example.com'}</Paragraph>
            <Paragraph style={styles.role}>
              {user?.role === 'customer' ? 'Customer' : 'Partner'}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Account Information</List.Subheader>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={() => {
            // TODO: Navigate to edit profile screen
          }}
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
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Notifications"
          description="Manage notification settings"
          left={props => <List.Icon {...props} icon="bell" />}
          onPress={() => navigation.navigate('Settings' as never)}
        />
        <List.Item
          title="Privacy"
          description="Privacy and security settings"
          left={props => <List.Icon {...props} icon="shield" />}
          onPress={() => {
            // TODO: Navigate to privacy settings
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
          title="Contact Us"
          description="Get in touch with support"
          left={props => <List.Icon {...props} icon="message" />}
          onPress={() => {
            // TODO: Navigate to contact screen
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
  profileCard: {
    margin: 16,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  role: {
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    marginVertical: 8,
  },
});

export default ProfileScreen;
