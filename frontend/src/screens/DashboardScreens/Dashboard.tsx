/*
MIT License

Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { Card, Popconfirm, Modal, Input } from "antd";
import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import EmptyImg from "assets/images/empty.svg";
import {PropagateLoader} from "react-spinners";
import http from "utils/api";
import "./styles.scss";
import Swal from "sweetalert2";
// @ts-ignore
import {Progress} from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string;
  visibility: string;
  cards_count: number;
  is_owner: boolean;
  progress: number;
  tags: any
}

const Dashboard = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [fetchingDecks, setFetchingDecks] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {Search} = Input;

  const flashCardUser = window.localStorage.getItem("flashCardUser");
  const {localId} = (flashCardUser && JSON.parse(flashCardUser)) || {};

  useEffect(() => {
    fetchDecks();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const fetchDecks = async () => {
    setFetchingDecks(true);
    const params = {localId};
    await http
        .get("/deck/all", {
          params,
        })
        .then((res) => {
          const {decks: _decks} = res.data || {};
          setDecks(_decks);
          setFetchingDecks(false);
        })
        .catch((err) => {
          setDecks([]);
          setFetchingDecks(false);
        });
  };

  const handleInviteFriend = async (id: any, email: any) => {
    const payload = {
      email: email
    };
    await http
        .post(`/deck/invite/${id}`, payload)
        .then((res) => {
          const {id} = res.data;
          Swal.fire({
            icon: 'success',
            title: 'Invited Friend Successfully!',
            text: 'You have successfully invited a friend',
            confirmButtonColor: '#221daf',
          })
        })
        .catch((err) => {
          Swal.fire({
            icon: 'error',
            title: 'Could Not Invite Friend!',
            text: 'An error occurred, please try again',
            confirmButtonColor: '#221daf',
          })
        });
  };

  const handleDeleteDeck = async (id: any) => {

    await http
        .delete(`/deck/delete/${id}`)
        .then((res) => {
          const {id} = res.data;
          Swal.fire({
            icon: 'success',
            title: 'Deck Deleted Successfully!',
            text: 'You have successfully deleted a deck',
            confirmButtonColor: '#221daf',
          }).then(() => {
            window.location.replace(`/dashboard`);
          })
        })
        .catch((err) => {
          Swal.fire({
            icon: 'error',
            title: 'Deck Deletion Failed!',
            text: 'An error occurred, please try again',
            confirmButtonColor: '#221daf',
          })
        });
  };

  return (
      <div className="dashboard-page dashboard-commons">
        <section>
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <Card className="welcome-card border-[#E7EAED]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3>
                        <b>Hey, Welcome Back!</b> 👋
                      </h3>
                      <p className="">
                        Let's start creating, memorizing and sharing your
                        flashcards.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flash-card__list row mt-4">
              <div className="col-md-12">
                <p className="title">Your Library</p>
              </div>
              {fetchingDecks ? (
                  <div
                      className="col-md-12 text-center d-flex justify-content-center align-items-center"
                      style={{height: "300px"}}
                  >
                    <PropagateLoader color="#221daf"/>
                  </div>
              ) : decks.length === 0 ? (
                  <div className="row justify-content-center empty-pane">
                    <div className="text-center">
                      <img className="img-fluid" src={EmptyImg}/>
                      <p>No Study Deck Created Yet</p>
                    </div>
                  </div>
              ) : (
                  decks.map(
                      ({id, title, description, visibility, cards_count, is_owner, progress, tags}, index) => {
                        return (
                            <div className="col-md-4">
                              <div className="flash-card__item">
                                <div className="d-flex justify-content-between align-items-center">
                                  <Link to={`/deck/${id}/practice`}>
                                    <h5>{title}</h5>
                                  </Link>
                                  <div>
                                    {
                                      visibility === "private" && is_owner == true ? (
                                          <>
                                            <button className="btn btn-sm text-dark" onClick={showModal}>
                                              <i className="lni lni-users"></i> Invite
                                            </button>
                                            <Modal title="Invite Friends" open={isModalOpen} onOk={handleOk}
                                                   onCancel={handleCancel}>
                                              <Search
                                                  placeholder="input email"
                                                  enterButton="Invite"
                                                  size="large"
                                                  onSearch={value => handleInviteFriend(id, value)}
                                              />
                                            </Modal>
                                          </>
                                      ) : ("")
                                    }
                                  </div>
                                  <div className="d-flex gap-2 visibility-status align-items-center">
                                    {visibility === "public" ? (
                                        <i className="lni lni-world"></i>
                                    ) : visibility === "private" ? (
                                        <i className="lni lni-lock-alt"></i>
                                    ) : null}{" "}
                                    {visibility}
                                  </div>
                                </div>
                                <p className="description">{description}</p>
                                <p className="items-count">{cards_count} item(s)</p>
                                <p className="parent-tag">
                                  Tags: {tags.map((tag: { content: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => <h6 className="child-tag">{tag.content}</h6>)}
                                </p>

                        <div className="d-flex menu">
                          <div className="col">
                            <Link to={`/deck/${id}/practice`}>
                              <button className="btn text-left">
                                <i className="lni lni-book"></i> Practice
                              </button>
                            </Link>
                          </div>
                          <div className="col d-flex justify-content-center">
                            {
                                is_owner === true ? (
                                  <Link to={`/deck/${id}/update`}>
                                      <button className="btn text-edit">
                                        <i className="lni lni-pencil-alt"></i> Update
                                      </button>
                                  </Link>
                                ): null
                            }
                          </div>
                          <div className="col d-flex justify-content-end">
                          {
                                is_owner === true ? (
                                  <Popconfirm
                                      title="Are you sure to delete this task?"
                                      onConfirm={() => handleDeleteDeck(id)}
                                      okText="Yes"
                                      cancelText="No"
                                    >
                                      <button className="btn text-danger">
                                        <i className="lni lni-trash-can"></i> Delete
                                      </button>
                                  </Popconfirm>
                                ): null
                            }
                          </div>
                        </div>
                        <Progress
                          percent={Math.min(progress, 100)}
                          theme={{
                            success: {
                              symbol: '🏄‍',
                              color: 'rgb(245, 66, 155)'
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
