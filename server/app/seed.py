from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.main import build_social_links
from app.models import BusinessCard

cards = [
    {
        "slug": "alex-morgan",
        "fullName": "Alex Morgan",
        "jobTitle": "Product Designer",
        "company": "Northstar Studio",
        "bio": "Designs crisp product experiences for early-stage teams.",
        "email": "alex.morgan@example.com",
        "phone": "+1 415 555 0134",
        "website": "https://alexmorgan.example.com",
        "location": "San Francisco, CA",
        "avatarUrl": "https://images.example.com/alex-morgan.jpg",
        "socialLinks": [
            {"platform": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/alexmorgan"},
            {"platform": "github", "label": "GitHub", "url": "https://github.com/alexmorgan"},
        ],
    },
    {
        "slug": "nina-patel",
        "fullName": "Nina Patel",
        "jobTitle": "Event Producer",
        "company": "Bright Room Events",
        "bio": "Builds launch events, private dinners, and community programs.",
        "email": "nina.patel@example.com",
        "phone": "+1 212 555 0198",
        "website": "https://brightroom.example.com",
        "location": "New York, NY",
        "avatarUrl": "https://images.example.com/nina-patel.jpg",
        "socialLinks": [
            {"platform": "instagram", "label": "Instagram", "url": "https://instagram.com/ninapatel"}
        ],
    },
    {
        "slug": "sam-rivera",
        "fullName": "Sam Rivera",
        "jobTitle": "Frontend Engineer",
        "company": "Orbit Labs",
        "bio": "Turns design systems into fast, accessible web apps.",
        "email": "sam.rivera@example.com",
        "phone": "+1 646 555 0176",
        "website": "https://samrivera.example.com",
        "location": "Austin, TX",
        "avatarUrl": "https://images.example.com/sam-rivera.jpg",
        "socialLinks": [
            {"platform": "x", "label": "X", "url": "https://x.com/samrivera"},
            {"platform": "dribbble", "label": "Dribbble", "url": "https://dribbble.com/samrivera"},
        ],
    },
]


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        for data in cards:
            card_data = data.copy()
            social_links = card_data.pop("socialLinks")
            card = session.exec(
                select(BusinessCard).where(BusinessCard.slug == card_data["slug"])
            ).first()
            if card is None:
                card = BusinessCard(**card_data)
            else:
                for key, value in card_data.items():
                    setattr(card, key, value)
                card.socialLinks.clear()

            card.socialLinks = build_social_links(social_links)
            session.add(card)

        session.commit()
    print("Seed data has been loaded.")


if __name__ == "__main__":
    main()
