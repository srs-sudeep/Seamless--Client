import { useState } from 'react';
import {
  Loader2,
  BookOpen,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  MapPin,
  Hash,
  CreditCard,
  Building,
} from 'lucide-react';
import { DynamicTable, HelmetWrapper, Badge } from '@/components';
import { useCheckouts } from '@/hooks/gyankosh/useCheckouts.hook';
import type { Checkout } from '@/types/gyankosh/checkout.types';

const Checkouts = () => {
  const { data: checkouts = [], isFetching, error } = useCheckouts();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysDifference = (date1: string, date2: string = new Date().toISOString()) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d1.getTime() - d2.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (checkout: Checkout) => {
    if (checkout.return_date || checkout.checkin_date) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Returned
        </Badge>
      );
    } else if (checkout.is_overdue) {
      const overdueDays = Math.abs(getDaysDifference(checkout.due_date));
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue ({overdueDays}d)
        </Badge>
      );
    } else {
      const daysUntilDue = getDaysDifference(checkout.due_date);
      if (daysUntilDue <= 3) {
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Due Soon ({daysUntilDue}d)
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-blue/10 text-blue border-blue/20">
            <BookOpen className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      }
    }
  };

  const getRenewalsBadge = (renewalsCount: number) => {
    if (renewalsCount === 0) {
      return <Badge className="bg-muted/10 text-muted-foreground border-muted/20">None</Badge>;
    } else {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <RefreshCw className="w-3 h-3 mr-1" />
          {renewalsCount}x
        </Badge>
      );
    }
  };

  const customRender = {
    'Book Title': (value: string, row: Record<string, any>) => {
      const checkout = row._row as Checkout;
      return (
        <div className="flex items-start gap-3">
          <div className="space-y-1">
            <span className="font-medium text-foreground line-clamp-2">{value}</span>
            <div className="text-xs text-muted-foreground">
              by {checkout.author || 'Unknown Author'}
            </div>
            {checkout.isbn && (
              <div className="text-xs text-muted-foreground">ISBN: {checkout.isbn}</div>
            )}
          </div>
        </div>
      );
    },
    'Patron Name': (value: string, row: Record<string, any>) => {
      const checkout = row._row as Checkout;
      return (
        <div className="space-y-1">
          <span className="font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {value}
          </span>
          <div className="text-xs text-muted-foreground font-mono">
            Card: {checkout.patron_cardnumber}
          </div>
        </div>
      );
    },
    'Checkout Date': (value: string) => {
      return (
        <span className="flex items-center gap-1 text-sm">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          {formatDate(value)}
        </span>
      );
    },
    'Due Date': (value: string, row: Record<string, any>) => {
      const checkout = row._row as Checkout;
      const daysUntilDue = getDaysDifference(value);
      const isOverdue = checkout.is_overdue;

      return (
        <div className="space-y-1">
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              isOverdue
                ? 'text-destructive'
                : daysUntilDue <= 3
                  ? 'text-warning'
                  : 'text-foreground'
            }`}
          >
            <Clock className="w-3 h-3" />
            {formatDate(value)}
          </span>
          <div className="text-xs text-muted-foreground">
            {isOverdue
              ? `${Math.abs(daysUntilDue)} days overdue`
              : daysUntilDue > 0
                ? `${daysUntilDue} days left`
                : 'Due today'}
          </div>
        </div>
      );
    },
    Status: (value: string, row: Record<string, any>) => {
      const checkout = row._row as Checkout;
      return getStatusBadge(checkout);
    },
    Renewals: (value: number) => getRenewalsBadge(value),
    'Item Barcode': (value: string) => {
      if (!value) return <span className="text-muted-foreground">N/A</span>;
      return (
        <span className="font-mono text-sm bg-muted/30 px-2 py-1 rounded border">{value}</span>
      );
    },
    Library: (value: string) => {
      return (
        <span className="flex items-center gap-1 text-sm font-medium">
          <Building className="w-3 h-3 text-primary" />
          {value}
        </span>
      );
    },
  };

  const getTableData = (checkouts: Checkout[]) =>
    checkouts.map(checkout => ({
      Id: checkout.checkout_id,
      'Book Title': checkout.title,
      'Patron Name': checkout.patron_name,
      'Checkout Date': checkout.checkout_date,
      'Due Date': checkout.due_date,
      Status: checkout.status,
      Renewals: checkout.renewals_count,
      'Item Barcode': checkout.item_barcode,
      Library: checkout.home_library,
      _row: { ...checkout },
      _expandable: true,
    }));

  // Expandable component for checkout details
  const renderExpandedComponent = (row: Record<string, any>) => {
    const checkout = row._row as Checkout;

    return (
      <div className="bg-muted/30 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-semibold text-foreground">
            Checkout Details - #{checkout.checkout_id}
          </h4>
        </div>

        {/* Checkout Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Book Information Card */}
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Book Information
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium">{checkout.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span className="font-medium">{checkout.author || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biblio ID:</span>
                <span className="font-mono font-medium">{checkout.biblio_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item ID:</span>
                <span className="font-mono font-medium">{checkout.item_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ISBN:</span>
                <span className="font-medium">{checkout.isbn || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Type:</span>
                <span className="font-medium">{checkout.item_type}</span>
              </div>
            </div>
          </div>

          {/* Patron Information Card */}
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Patron Information
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{checkout.patron_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patron ID:</span>
                <span className="font-mono font-medium">{checkout.patron_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card Number:</span>
                <span className="font-mono font-medium">{checkout.patron_cardnumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(checkout)}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Timeline */}
        <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
          <h5 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Checkout Timeline
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <span className="text-muted-foreground">Checkout Date:</span>
              <div className="font-medium">{formatDateTime(checkout.checkout_date)}</div>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Due Date:</span>
              <div className={`font-medium ${checkout.is_overdue ? 'text-destructive' : ''}`}>
                {formatDateTime(checkout.due_date)}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Return Date:</span>
              <div className="font-medium">
                {checkout.return_date ? formatDateTime(checkout.return_date) : 'Not returned'}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Last Seen:</span>
              <div className="font-medium">{formatDateTime(checkout.last_seen_date)}</div>
            </div>
          </div>
        </div>

        {/* Renewal Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              Renewal Information
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Renewals Count:</span>
                {getRenewalsBadge(checkout.renewals_count)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Renewed:</span>
                <span className="font-medium">{formatDate(checkout.last_renewed_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auto Renew:</span>
                <span className="font-medium">{checkout.auto_renew ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unseen Renewals:</span>
                <span className="font-medium">{checkout.unseen_renewals}</span>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location Information
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Home Library:</span>
                <span className="font-medium">{checkout.home_library}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holding Library:</span>
                <span className="font-medium">{checkout.holding_library}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{checkout.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Call Number:</span>
                <span className="font-medium">{checkout.call_number || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(checkout.note || checkout.auto_renew_error) && (
          <div className="bg-card border-2 border-border rounded-xl p-4 space-y-3">
            <h5 className="font-semibold text-foreground flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              Additional Information
            </h5>
            {checkout.note && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Note:</span>
                <p className="text-sm">{checkout.note}</p>
                {checkout.note_date && (
                  <div className="text-xs text-muted-foreground">
                    Added: {formatDateTime(checkout.note_date)}
                  </div>
                )}
              </div>
            )}
            {checkout.auto_renew_error && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Auto Renew Error:</span>
                <p className="text-sm text-destructive">{checkout.auto_renew_error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isFetching && checkouts.length === 0) {
    return (
      <HelmetWrapper
        title="Checkouts | Gyankosh"
        heading="Checkouts"
        subHeading="Manage library checkouts and returns"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading checkouts...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  if (error) {
    return (
      <HelmetWrapper
        title="Checkouts | Gyankosh"
        heading="Checkouts"
        subHeading="Manage library checkouts and returns"
      >
        <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Checkouts</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </HelmetWrapper>
    );
  }

  // Calculate statistics
  const activeCheckouts = checkouts.filter(c => !c.return_date && !c.checkin_date);
  const overdueCheckouts = checkouts.filter(c => c.is_overdue && !c.return_date);
  const returnedCheckouts = checkouts.filter(c => c.return_date || c.checkin_date);

  return (
    <HelmetWrapper
      title="Checkouts | Gyankosh"
      heading="Checkouts"
      subHeading="Manage library checkouts and returns"
    >
      <div className="space-y-8">
        {/* Header with Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="text-sm font-medium text-muted-foreground">Total Checkouts</h6>
                <p className="text-lg font-semibold text-foreground">{checkouts.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="text-sm font-medium text-muted-foreground">Active Checkouts</h6>
                <p className="text-lg font-semibold text-foreground">{activeCheckouts.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="text-sm font-medium text-muted-foreground">Overdue Checkouts</h6>
                <p className="text-lg font-semibold text-foreground">{overdueCheckouts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="text-sm font-medium text-muted-foreground">Returned Checkouts</h6>
                <p className="text-lg font-semibold text-foreground">{returnedCheckouts.length}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Checkouts Table */}
        {checkouts.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Checkouts Found</h3>
            <p className="text-muted-foreground">No checkout records are currently available.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
            <DynamicTable
              tableHeading={`Checkouts (${checkouts.length})`}
              data={getTableData(checkouts)}
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

export default Checkouts;
