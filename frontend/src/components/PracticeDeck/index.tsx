import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import http from "utils/api";

import "./styles.scss";

import { Pagination, Navigation } from "swiper";
import ReactCardFlip from "react-card-flip";
import { useState, useRef, useEffect } from "react";

export default function Flashcard({deck, cards}: any) {
    const flashCardUser = window.localStorage.getItem("flashCardUser");
    const { localId } = (flashCardUser && JSON.parse(flashCardUser)) || {};

    const [initialSlide, setInitialSlide] = useState(0);
    const fetchDeckProgress = async () => {
        const params = { localId };
        http
          .get(`/deck/progress/${deck.id}`, {params})
          .then((res) => {
            const { deckProgress } = res.data || {};
            const _initialSlide = deckProgress == null? 0: deckProgress.currentIndex;
            setInitialSlide(_initialSlide);
          })
          .catch((err) => {
            console.log(err);
          });
    };

    const saveProgress = async(deckId: any, currentIndex: any) => {
        const payload = {
          userId: localId,
          currentIndex: currentIndex
        };
        await http
            .post(`/deck/progress/${deckId}`, payload)
            .then((res) => {
                console.log("Saved study progress");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const swiper = useRef<any>(null);
    const setSwiper = (newSwiper: any) => {
        swiper.current = newSwiper;
     };

    useEffect(() => {
        fetchDeckProgress();
        if(swiper && swiper.current && initialSlide) {
          swiper.current.slideTo(initialSlide)
        }
    }, [initialSlide])

console.log(initialSlide)
  return (
    <>
      <Swiper
        initialSlide={initialSlide}
        pagination={{
          type: "progressbar",
        }}
        onSwiper={setSwiper}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="mySwiper"
        onSlideChange={(swiperCore) => {
            saveProgress(deck.id, swiperCore.activeIndex);
        }}
      >
        {cards.map(({ front, back, hint }: any, index: number) => {
          return (
            <SwiperSlide>
              <Card
                index={index}
                total={cards.length}
                front={front}
                back={back}
              />
            </SwiperSlide>
          );
        })}
        <SwiperSlide>
          <div className="card-item final-view">
            <div>
              <p>Yaaay! You have come to the end of your practice 🎉🎊</p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </>
  );
}

const Card = ({ front, back, index, total }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
      <div className="card-item" onClick={() => setIsFlipped(!isFlipped)}>
        <div>
          <p>Front</p>
          <h2>{front}</h2>
        </div>
        <div className="bottom">
            <p>{index + 1} / {total}</p>
        </div>
      </div>
      <div className="card-item" onClick={() => setIsFlipped(!isFlipped)}>
        <div>
          <p>Back</p>
          <h2>{back}</h2>
        </div>
        <div className="bottom">
            <p>{index + 1} / {total}</p>
        </div>
      </div>
    </ReactCardFlip>
  );
};
