import { BookOpen, User, Hash, CheckCircle, Clock } from 'lucide-react';
import { HelmetWrapper, Badge, Card, CardContent } from '@/components';
import { useBooks } from '@/hooks/gyankosh/useBooks.hook';

const Books = () => {
  const { data: books = [], isFetching, error } = useBooks();

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
  // Shimmer loading component for book cards
  const BookCardSkeleton = () => (
    <Card className="bg-gradient-to-br from-card to-card/80 border-2">
      <CardContent className="p-6 space-y-4">
        {/* Book Cover Skeleton */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
            </div>
          </div>
          {/* Status Badge Skeleton */}
          <div className="absolute top-2 right-2">
            <div className="h-6 w-16 bg-muted/50 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Book Details Skeleton */}
        <div className="space-y-3">
          <div>
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse"></div>
            </div>
            {/* Author Skeleton */}
            <div className="flex items-center gap-1 mt-2">
              <div className="w-3 h-3 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-3 bg-muted/50 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>

          {/* Copy Information Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted/50 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-muted/50 rounded w-8 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-3 bg-muted/50 rounded w-6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <HelmetWrapper
        title="Books | Gyankosh"
        heading="Books"
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
      title="Books | Gyankosh"
      heading="Books"
      subHeading="Browse and manage library books"
    >
      <div className="space-y-8">
        {isFetching && books.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Show 8 shimmer cards */}
            {Array.from({ length: 8 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ) : books.length === 0 ? (
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
                className="border-2 bg-gradient-to-br from-card to-card/80"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden">
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
                      <h3 className="font-semibold text-foreground line-clamp-2">{book.title}</h3>
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
    </HelmetWrapper>
  );
};

export default Books;
