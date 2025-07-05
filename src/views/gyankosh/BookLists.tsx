import { useState } from 'react';
import { Loader2, BookOpen, User, Calendar, MapPin, Hash, CheckCircle, Clock } from 'lucide-react';
import {
  HelmetWrapper,
  Badge,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@/components';
import { useBooks } from '@/hooks/gyankosh/useBooks.hook';
import type { Book, BookItem } from '@/types/gyankosh/book.types';

const BookLists = () => {
  const { data: books = [], isFetching, error } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string, isOverdue?: boolean) => {
    if (status === 'available') {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Available
        </Badge>
      );
    } else if (isOverdue) {
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <Clock className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          <Clock className="w-3 h-3 mr-1" />
          Checked Out
        </Badge>
      );
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isFetching && books.length === 0) {
    return (
      <HelmetWrapper
        title="Book Lists | Gyankosh"
        heading="Book Lists"
        subHeading="Browse and manage library books"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  if (error) {
    return (
      <HelmetWrapper
        title="Book Lists | Gyankosh"
        heading="Book Lists"
        subHeading="Browse and manage library books"
      >
        <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Books</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Book Lists | Gyankosh"
      heading="Book Lists"
      subHeading="Browse and manage library books"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-primary" />
              Library Catalog
            </h2>
            <p className="text-muted-foreground mt-2">
              Browse available books and manage checkouts. Click on any book to view details.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Books</p>
            <p className="text-2xl font-bold text-primary">{books.length}</p>
          </div>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Books Available</h3>
            <p className="text-muted-foreground">The library catalog is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <Card
                key={book.biblio_id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/80"
                onClick={() => handleBookClick(book)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`${book.cover_image_url ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20`}
                    >
                      <BookOpen className="w-12 h-12 text-primary/60" />
                    </div>

                    {/* Status Badge Overlay */}
                    <div className="absolute top-2 right-2">{getStatusBadge(book.status)}</div>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span className="line-clamp-1">{book.author}</span>
                      </div>
                    </div>

                    {/* Copy Information */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium text-success">
                          {book.available_copies}/{book.total_copies}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Hash className="w-3 h-3" />
                        <span>{book.biblio_id}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Book Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Book Details
            </DialogTitle>
          </DialogHeader>

          {selectedBook && (
            <div className="space-y-6">
              {/* Book Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Book Cover */}
                <div className="lg:col-span-1">
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden">
                    {selectedBook.cover_image_url ? (
                      <img
                        src={selectedBook.cover_image_url}
                        alt={selectedBook.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`${selectedBook.cover_image_url ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20`}
                    >
                      <BookOpen className="w-16 h-16 text-primary/60" />
                    </div>
                  </div>
                </div>

                {/* Book Information */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedBook.title}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <User className="w-4 h-4" />
                      <span className="text-lg">{selectedBook.author}</span>
                    </div>
                    {getStatusBadge(selectedBook.status)}
                  </div>

                  <Separator />

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Biblio ID:</span>
                        <span className="font-medium">{selectedBook.biblio_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISBN:</span>
                        <span className="font-medium">{selectedBook.isbn || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Series:</span>
                        <span className="font-medium">{selectedBook.series || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-medium">{selectedBook.subject || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Call Number:</span>
                        <span className="font-medium">{selectedBook.call_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Copies:</span>
                        <span className="font-medium">{selectedBook.total_copies}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Copy Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-primary" />
                  Available Copies ({selectedBook.available_copies} of {selectedBook.total_copies})
                </h3>

                <div className="grid gap-4">
                  {selectedBook.items.map((item: BookItem) => (
                    <Card
                      key={item.item_id}
                      className={`border-2 ${
                        item.status === 'available'
                          ? 'border-success/20 bg-success/5'
                          : isOverdue(item.due_date)
                            ? 'border-destructive/20 bg-destructive/5'
                            : 'border-warning/20 bg-warning/5'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Item ID:</span>
                                <Badge variant="outline">{item.item_id}</Badge>
                              </div>
                              {item.barcode && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Barcode:</span>
                                  <Badge variant="outline">{item.barcode}</Badge>
                                </div>
                              )}
                              {getStatusBadge(item.status, isOverdue(item.due_date))}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{item.home_library}</span>
                              </div>
                              {item.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due: {formatDate(item.due_date)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Last seen: {formatDate(item.last_seen)}</span>
                              </div>
                              {item.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{item.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default BookLists;
