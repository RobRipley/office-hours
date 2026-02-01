import { useGetAdminSummary } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info, TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminPanel() {
  const { data: adminSummary, isLoading } = useGetAdminSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Admin Panel
        </h2>
        <p className="text-muted-foreground mt-1">Manage users and view system statistics</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Admin features are managed through the backend authorization system. User roles and access control are
          handled automatically based on the passphrase authentication.
        </AlertDescription>
      </Alert>

      {/* Shift Statistics - 6 Week Window */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Shift Statistics (Next 6 Weeks)
          </CardTitle>
          <CardDescription>Overview of scheduled and claimed shifts</CardDescription>
        </CardHeader>
        <CardContent>
          {adminSummary ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Shifts</div>
                <div className="text-3xl font-bold text-primary">
                  {adminSummary.shiftStats.totalShifts.toString()}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-sm font-medium text-muted-foreground mb-1">Claimed Shifts</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {adminSummary.shiftStats.claimedShifts.toString()}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-sm font-medium text-muted-foreground mb-1">Unclaimed Shifts</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {adminSummary.shiftStats.unclaimedShifts.toString()}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Associate Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Breakdown by Associate (Next 6 Weeks)
          </CardTitle>
          <CardDescription>Number of claimed shifts per team member</CardDescription>
        </CardHeader>
        <CardContent>
          {adminSummary && adminSummary.associateSummaries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Associate Name</TableHead>
                  <TableHead className="text-right">Claimed Shifts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminSummary.associateSummaries.map((associate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{associate.name}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        {associate.claimedShifts.toString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No claimed shifts in the next 6 weeks</p>
          )}
        </CardContent>
      </Card>

      {/* System Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage team members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Users are automatically added when they authenticate with the correct passphrase. The first user becomes
              the admin.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Manage permissions and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access is controlled through the backend authorization system. Users must authenticate with Internet
              Identity and provide the team passphrase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passphrase</CardTitle>
            <CardDescription>Team access passphrase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The passphrase is set during initial deployment. Contact the system administrator to change it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Application health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
