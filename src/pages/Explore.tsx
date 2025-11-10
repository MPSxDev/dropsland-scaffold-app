import React, { useState } from "react";
import { BuyDialog } from "../components/BuyDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Artist {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  genres: string[];
  isFeatured: boolean;
  tokenSymbol?: string;
}

const filterTabs: Array<{
  id: "all" | "artists" | "tokens" | "nfts";
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "artists", label: "Artists" },
  { id: "tokens", label: "Tokens" },
  { id: "nfts", label: "NFTs" },
];

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "artists" | "tokens" | "nfts">(
    "all",
  );
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);

  const artists: Artist[] = [
    {
      id: "1",
      name: "iamjuampi",
      handle: "iamjuampi",
      genres: ["Tech-House"],
      isFeatured: true,
      tokenSymbol: "JUAMPI",
    },
    {
      id: "2",
      name: "Banger",
      handle: "banger",
      genres: ["DNB", "Tech-House"],
      isFeatured: true,
      tokenSymbol: "BANG",
    },
  ];

  const handleBuyClick = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsBuyDialogOpen(true);
  };

  const handleBuyConfirm = async (amount: number) => {
    if (!selectedArtist) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.info(
      `Purchasing ${amount} ${selectedArtist.tokenSymbol} with USDC`,
    );
  };

  const searchMatches = artists.filter((artist) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      artist.name.toLowerCase().includes(query) ||
      artist.handle.toLowerCase().includes(query) ||
      artist.genres.some((genre) => genre.toLowerCase().includes(query))
    );
  });

  const filteredArtists =
    filter === "artists" || filter === "all" ? searchMatches : [];

  return (
    <div className="container space-y-8 px-4 py-10">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Discover & Collect
        </p>
        <h1 className="text-4xl font-bold text-white">Explore Dropsland</h1>
        <p className="max-w-2xl text-muted-foreground">
          Search rising DJs, discover social tokens, and scoop NFTs that unlock
          IRL moments. Everything is powered by Stellar smart contracts.
        </p>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <label
              htmlFor="search"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Search the catalog
            </label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists, tokens, or NFTs..."
            />
          </div>
          <div className="flex flex-wrap gap-2 self-end">
            {filterTabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant={filter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(tab.id)}
                className="flex-1 min-w-[100px]"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Artists</h2>
            <p className="text-sm text-muted-foreground">
              Tokenized collectives and DJs you can support right now.
            </p>
          </div>

          <div className="space-y-4">
            {filteredArtists.map((artist) => (
              <Card
                key={artist.id}
                className="border-border/60 bg-gradient-to-r from-background/80 to-background/40"
              >
                <CardContent className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-background/60 text-lg font-semibold text-amber-200">
                      {artist.avatar ? (
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="size-full rounded-full object-cover"
                        />
                      ) : (
                        artist.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl text-white">
                          {artist.name}
                        </CardTitle>
                        {artist.isFeatured && (
                          <Badge
                            variant="secondary"
                            className="uppercase tracking-wide"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardDescription>@{artist.handle}</CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {artist.genres.map((genre) => (
                          <Badge key={genre} variant="outline">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <p className="text-sm text-muted-foreground">
                      Token: {artist.tokenSymbol ?? "TBD"}
                    </p>
                    <Button
                      onClick={() => handleBuyClick(artist)}
                      className="w-full md:w-auto"
                    >
                      💰 Buy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {selectedArtist && (
        <BuyDialog
          visible={isBuyDialogOpen}
          onClose={() => {
            setIsBuyDialogOpen(false);
            setSelectedArtist(null);
          }}
          tokenSymbol={selectedArtist.tokenSymbol || ""}
          onConfirm={handleBuyConfirm}
        />
      )}
    </div>
  );
};

export default Explore;
