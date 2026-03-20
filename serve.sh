#!/usr/bin/bash
/usr/bin/perl -MIO::Socket::INET -e '
use IO::Socket::INET;
my $srv = IO::Socket::INET->new(LocalPort=>8080,Listen=>20,ReuseAddr=>1) or die "Cannot bind: $!";
print "Serving on http://localhost:8080\n";
while (my $c = $srv->accept) {
  my $req = <$c>;
  next unless defined $req && $req =~ /\S/;
  my (undef,$path) = split / /, $req;
  # Drain remaining request headers
  while (my $line = <$c>) { last if $line =~ /^\r?\n$/; }
  $path =~ s/\?.*// if defined $path;
  $path = "/index.html" if !$path || $path eq "/";
  my $file = "." . $path;
  if (-f $file) {
    open my $fh, "<:raw", $file or do { print $c "HTTP/1.1 500 Error\r\nConnection: close\r\n\r\n"; close $c; next; };
    local $/; my $body = <$fh>; close $fh;
    my $ct = "text/html; charset=utf-8";
    $ct = "application/javascript; charset=utf-8" if $file =~ /\.js$/;
    $ct = "text/css; charset=utf-8" if $file =~ /\.css$/;
    $ct = "image/png" if $file =~ /\.png$/;
    $ct = "image/jpeg" if $file =~ /\.jpe?g$/;
    $ct = "image/svg+xml" if $file =~ /\.svg$/;
    $ct = "application/json" if $file =~ /\.json$/;
    print $c "HTTP/1.1 200 OK\r\nContent-Type: $ct\r\nContent-Length: " . length($body) . "\r\nConnection: close\r\nAccess-Control-Allow-Origin: *\r\nCache-Control: no-cache\r\n\r\n$body";
  } else {
    print $c "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n";
  }
  close $c;
}
'
