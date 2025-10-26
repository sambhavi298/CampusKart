import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { apiCall } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { CheckCircle2, User, Mail, Shield, Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  aadharVerified: boolean;
  aadharNumber?: string;
  createdAt: string;
}

interface ProfilePageProps {
  onVerificationChange: (verified: boolean) => void;
}

export function ProfilePage({ onVerificationChange }: ProfilePageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await apiCall('/user');
      setUserData(data.user);
      onVerificationChange(data.user.aadharVerified);
    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAadhar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const formData = new FormData(e.currentTarget);
      const aadharNumber = formData.get('aadhar') as string;

      await apiCall('/verify-aadhar', {
        method: 'POST',
        body: JSON.stringify({ aadharNumber }),
      });

      toast.success('Aadhar verified successfully!');
      loadUserData();
      e.currentTarget.reset();
    } catch (error: any) {
      console.error('Error verifying Aadhar:', error);
      toast.error(error.message || 'Failed to verify Aadhar');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B35' }} />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your CampusKart account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p>{userData.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{userData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
              {userData.aadharVerified ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline">Not Verified</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aadhar Verification */}
      {!userData.aadharVerified && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>
              Enter your Aadhar number to start selling on CampusKart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyAadhar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aadhar">Aadhar Number</Label>
                <Input
                  id="aadhar"
                  name="aadhar"
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Aadhar number will be securely stored and used only for verification purposes
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#FF6B35' }}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Aadhar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Already Verified */}
      {userData.aadharVerified && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-medium">Identity Verified</p>
                <p className="text-sm">You can now list products for sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <p className="text-sm text-orange-900">
            <strong>Important:</strong> CampusKart is for the campus community only. All transactions are offline. 
            Please meet in safe, public places on campus and verify items before completing any transaction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
