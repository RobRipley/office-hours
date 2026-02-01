import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import PublicCalendar from './components/PublicCalendar';
import AuthenticatedView from './components/AuthenticatedView';
import ProfileSetupModal from './components/ProfileSetupModal';
import PassphraseModal from './components/PassphraseModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const {
    data: userRole,
    isLoading: roleLoading,
    isFetched: roleFetched,
  } = useGetCallerUserRole();

  // Show profile setup if authenticated, profile loaded, and no profile exists
  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Show passphrase modal if profile exists but user is still a guest
  const showPassphraseModal =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile !== null &&
    !roleLoading &&
    roleFetched &&
    userRole === 'guest';

  // User has full access if they have a profile and are not a guest
  const hasAccess =
    isAuthenticated &&
    userProfile !== null &&
    userRole !== undefined &&
    userRole !== 'guest';

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!isAuthenticated ? (
            <PublicCalendar />
          ) : hasAccess ? (
            <AuthenticatedView userRole={userRole} />
          ) : (
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-semibold mb-4">Setting up your account...</h2>
                <p className="text-muted-foreground">
                  Please complete the setup process to access the scheduling system.
                </p>
              </div>
            </div>
          )}
        </main>
        <Footer />

        {showProfileSetup && <ProfileSetupModal />}
        {showPassphraseModal && <PassphraseModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
