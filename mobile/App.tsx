import {
  ClerkLoaded,
  ClerkProvider,
  useAuth,
  useClerk,
  useUser,
} from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { tokenCache } from '@clerk/expo/token-cache';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

type MeResponse = {
  data: {
    id: number;
    clerk_user_id: string;
    name: string;
    email: string;
    roles: string[];
    school: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  message: string;
};

async function getMe(token: string): Promise<MeResponse> {
  const response = await fetch(`${apiUrl}/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // Keep the generic status message if the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<MeResponse>;
}

function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    if (!isLoaded) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }

      setError('This sign-in needs another verification step.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>SafeSchool</Text>
      <Text style={styles.subtitle}>Sign in to continue.</Text>

      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />

      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        disabled={isSubmitting}
        onPress={() => void handleSignIn()}
        title={isSubmitting ? 'Signing in...' : 'Sign in'}
      />
    </View>
  );
}

function ProfileScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMe() {
      if (!isLoaded || !isSignedIn) {
        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          setError('No Clerk session token was returned.');
          return;
        }

        setError(null);
        setMe(await getMe(token));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile.');
      }
    }

    void loadMe();
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>SafeSchool</Text>
      <Text style={styles.subtitle}>{user?.primaryEmailAddress?.emailAddress}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {me ? (
        <View style={styles.profile}>
          <Text style={styles.name}>{me.data.name}</Text>
          <Text style={styles.text}>{me.data.email}</Text>
          <Text style={styles.text}>{me.data.roles.join(', ') || 'No role assigned'}</Text>
          <Text style={styles.text}>{me.data.school?.name ?? 'No school assigned'}</Text>
        </View>
      ) : !error ? (
        <ActivityIndicator />
      ) : null}

      <Button
        onPress={() => void signOut()}
        title="Sign out"
      />
    </View>
  );
}

function SafeSchoolMobile() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.panel}>
        <ActivityIndicator />
      </View>
    );
  }

  return isSignedIn ? <ProfileScreen /> : <SignInScreen />;
}

export default function App() {
  if (!clerkPublishableKey) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.</Text>
      </SafeAreaView>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <SafeAreaView style={styles.container}>
          <SafeSchoolMobile />
          <StatusBar style="auto" />
        </SafeAreaView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  name: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  panel: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  profile: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  text: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: '#020617',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
