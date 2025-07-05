import {
  Loader2,
  Users,
  User,
  Calendar,
  MapPin,
  Hash,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  CreditCard,
  Building,
} from 'lucide-react';
import { DynamicTable, HelmetWrapper, Badge } from '@/components';
import { usePatrons } from '@/hooks/gyankosh/usePatrons.hook';
import type { Patron } from '@/types/gyankosh/patron.types';

const PatronLists = () => {
  const { data: patrons = [], isFetching, error } = usePatrons();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted/10 text-muted-foreground border-muted/20">{status}</Badge>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; color: string }> = {
      S: { label: 'Staff', color: 'bg-primary/10 text-primary border-primary/20' },
      ST: { label: 'Student', color: 'bg-blue/10 text-blue border-blue/20' },
      PT: { label: 'Part-time', color: 'bg-orange/10 text-orange border-orange/20' },
      T: { label: 'Teacher', color: 'bg-purple/10 text-purple border-purple/20' },
      J: { label: 'Junior', color: 'bg-green/10 text-green border-green/20' },
      YA: { label: 'Young Adult', color: 'bg-cyan/10 text-cyan border-cyan/20' },
      IL: { label: 'Interlibrary', color: 'bg-pink/10 text-pink border-pink/20' },
      K: { label: 'Kids', color: 'bg-yellow/10 text-yellow border-yellow/20' },
    };

    const categoryInfo = categoryMap[category] || {
      label: category,
      color: 'bg-muted/10 text-muted-foreground border-muted/20',
    };

    return <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>;
  };

  const customRender = {
    Name: (value: string) => {
      return (
        <span className="font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          {value}
        </span>
      );
    },
    'Card Number': (value: string) => {
      return (
        <span className="font-mono text-sm bg-muted/30 px-2 py-1 rounded border">{value}</span>
      );
    },
    'Phone Number': (value: string) => {
      if (!value) return <span className="text-muted-foreground">N/A</span>;
      return (
        <span className="flex items-center gap-1 text-sm">
          <Phone className="w-3 h-3 text-muted-foreground" />
          {value}
        </span>
      );
    },
    Email: (value: string) => {
      if (!value) return <span className="text-muted-foreground">N/A</span>;
      return (
        <span className="flex items-center gap-1 text-sm">
          <Mail className="w-3 h-3 text-muted-foreground" />
          {value}
        </span>
      );
    },
    Status: (value: string) => getStatusBadge(value),
    Category: (value: string) => getCategoryBadge(value),
    Library: (value: string) => {
      return (
        <span className="flex items-center gap-1 text-sm font-medium">
          <Building className="w-3 h-3 text-primary" />
          {value}
        </span>
      );
    },
    'Overdues Count': (value: number) => {
      if (value === 0) {
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />0
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {value}
          </Badge>
        );
      }
    },
    'Has Fines': (value: boolean) => {
      return value ? (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Yes
        </Badge>
      ) : (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          No
        </Badge>
      );
    },
    'Expiry Date': (value: string) => {
      const expiryDate = new Date(value);
      const isExpired = expiryDate < new Date();

      return (
        <span
          className={`flex items-center gap-1 text-sm font-medium ${
            isExpired ? 'text-destructive' : 'text-foreground'
          }`}
        >
          <Calendar className="w-3 h-3" />
          {formatDate(value)}
        </span>
      );
    },
    'Date Enrolled': (value: string | null) => {
      return (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {formatDate(value)}
        </span>
      );
    },
  };

  const getTableData = (patrons: Patron[]) =>
    patrons.map(patron => ({
      'Patron ID': patron.patron_id,
      'Card Number': patron.cardnumber,
      Name: patron.name,
      'LDAP ID': patron.ldap_id || 'N/A',
      'Phone Number': patron.phone_number,
      Email: patron.email,
      Status: patron.status,
      Category: patron.category,
      Library: patron.library,
      'Overdues Count': patron.overdues_count,
      'Has Fines': patron.has_potential_fines,
      'Expiry Date': patron.expiry_date,
      'Date Enrolled': patron.date_enrolled,
      _row: { ...patron },
      _expandable: true,
    }));

  // Expandable component for patron details
  const renderExpandedComponent = (row: Record<string, any>) => {
    const patron = row._row as Patron;

    return (
      <div className="bg-muted/30 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-semibold text-foreground">{patron.name} - Patron Details</h4>
        </div>

        {/* Patron Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium">{patron.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card Number:</span>
                <span className="font-mono font-medium">{patron.cardnumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LDAP ID:</span>
                <span className="font-mono font-medium">{patron.ldap_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{patron.phone_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{patron.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Account Status
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(patron.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Category:</span>
                {getCategoryBadge(patron.category)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Library:</span>
                <span className="font-medium">{patron.library}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled:</span>
                <span className="font-medium">{formatDate(patron.date_enrolled)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium">{formatDate(patron.expiry_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Seen:</span>
                <span className="font-medium">{formatDate(patron.last_seen)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
          <h5 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Address Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Street:</span>
                <span className="font-medium">{patron.address.street || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">City:</span>
                <span className="font-medium">{patron.address.city || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">State:</span>
                <span className="font-medium">{patron.address.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Postal Code:</span>
                <span className="font-medium">{patron.address.postal_code || 'N/A'}</span>
              </div>
            </div>
            {patron.address.country && (
              <div className="col-span-full">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Country:</span>
                  <span className="font-medium">{patron.address.country}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Activity */}
        <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
          <h5 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Account Activity
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Overdue Items:</span>
              <div className="flex items-center gap-2">
                {patron.overdues_count === 0 ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {patron.overdues_count}
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {patron.overdues_count}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Has Potential Fines:</span>
              <div className="flex items-center gap-2">
                {patron.has_potential_fines ? (
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {patron.notes && (
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Notes
            </h5>
            <p className="text-sm text-muted-foreground">{patron.notes}</p>
          </div>
        )}
      </div>
    );
  };

  if (isFetching && patrons.length === 0) {
    return (
      <HelmetWrapper
        title="Patron Lists | Gyankosh"
        heading="Patron Lists"
        subHeading="Manage library patrons and members"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading patrons...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  if (error) {
    return (
      <HelmetWrapper
        title="Patron Lists | Gyankosh"
        heading="Patron Lists"
        subHeading="Manage library patrons and members"
      >
        <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Patrons</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Patron Lists | Gyankosh"
      heading="Patron Lists"
      subHeading="Manage library patrons and members"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              Library Patrons
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage patron accounts, view details, and track library usage. Click the expand arrow
              to view detailed information.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Patrons</p>
            <p className="text-2xl font-bold text-primary">{patrons.length}</p>
          </div>
        </div>

        {/* Patrons Table */}
        {patrons.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Patrons Found</h3>
            <p className="text-muted-foreground">No patron records are currently available.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
            <DynamicTable
              tableHeading={`Patrons (${patrons.length})`}
              data={getTableData(patrons)}
              customRender={customRender}
              isLoading={isFetching}
              expandableRows={true}
              expandedComponent={renderExpandedComponent}
              rowExpandable={row => row._expandable === true}
            />
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default PatronLists;
