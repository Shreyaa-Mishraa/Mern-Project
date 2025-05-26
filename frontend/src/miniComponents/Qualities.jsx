import React from "react";

const Qualities = () => {
  const qualities = [
    {
      id: 1,
      image: "/community.jpg",
      title: "COMMUNITY DEVELOPMENT",
      description:
        "We empower local communities through educational programs, skill-building workshops, and access to essential resources, fostering long-term growth and self-sufficiency.",
    },
    {
      id: 2,
      image: "/transparency.jpg",
      title: "TRANSPARENCY",
      description:
        "We maintain complete transparency in our operations and finances so that every donor and volunteer knows exactly where their contributions go and how they're making an impact.",
    },
    {
      id: 3,
      image: "/impact.jpg",
      title: "IMPACT MEASUREMENT",
      description:
        "Our work is guided by measurable outcomes. We track and report our progress, ensuring accountability and maximizing the positive change we bring to people's lives.",
    },
  ];

  return (
    <div className="qualities">
      <h2>OUR QUALITIES</h2>
      <div className="container">
        {qualities.map((element) => (
          <div className="card" key={element.id}>
            <div className="img-wrapper">
              <img src={element.image} alt={element.title} />
            </div>
            <div className="content">
              <p className="title">{element.title}</p>
              <p className="description">{element.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Qualities;
