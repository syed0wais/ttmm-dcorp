import { Models } from "appwrite";
import { Loader, UserCard } from "@/components/shared";
import {
  useFriends,
  useGetGroupsActivityById,
  useGetUserGroupsById,
} from "@/lib/react-query/queries";
import { useNavigate } from "react-router-dom";
import {
  getUniqueUserIdsFromGroups,
  processTransactions,
  simplifyTransactions,
} from "@/components/shared/Simplify";
import Scrollicon from "@/components/ui/Scrollicon";
import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";

const AllFriends = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const group: any = user.group;
  const {
    data: userGroupsData,
    isLoading: isUserGroupsLoading,
    isError: isErrorGroupsLoading,
  } = useGetUserGroupsById(group);
  const {
    data: GroupsActivity,
    isLoading: isGroupsActivityLoading,
    isError: isErrorGroupsActivity,
  } = useGetGroupsActivityById(group);

  const {
    data: friendList,
    isLoading: isfriendListLoading,
    isError: isErrorfriendList,
  } = useFriends(user.id);

  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
  };

  let userFriends: Models.Document[] = [];
  const userMemberGroups = GroupsActivity || [];
  const userGroups: Models.Document[] = userGroupsData || [];

  const [scrollTop, setScrollTop] = useState(0);
  const handleScroll = (event: {
    currentTarget: { scrollTop: SetStateAction<number> };
  }) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const simplifiedData2: { from: any; to: any; amount: number }[] =
    !isUserGroupsLoading ? simplifyTransactions(userGroups) : [];

  const uniqueUserIds = getUniqueUserIdsFromGroups(userGroups, user?.id);
  const uniqueUserIds2 = friendList?.documents[0]?.friendsId || [];

  // Function to merge JSON arrays while excluding duplicates based on ID
  const mergeUniqueUsers = (json1: any[], json2: any[]): any[] => {
    const merged: any[] = [...json1];
    const idsSet: Set<number> = new Set(json1.map((user) => user.id));

    json2.forEach((user) => {
      if (!idsSet.has(user.id)) {
        merged.push(user);
        idsSet.add(user.id);
      }
    });

    return merged;
  };

  if (
    (user &&
      user.list &&
      user.list.length > 0 &&
      !isUserGroupsLoading &&
      !isfriendListLoading) ||
    uniqueUserIds.length > 0
  ) {
    const mergedJson: any[] = mergeUniqueUsers(uniqueUserIds2, uniqueUserIds);
    userFriends = mergedJson;
  }
  const userId = user?.id;
  const jsonData = userMemberGroups;
  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }

  if (isErrorGroupsLoading || isErrorGroupsActivity || isErrorfriendList) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <div className="container p-2 flex flex-col">
          <div
            style={{ display: "flex", justifyContent: "space-between" }}
            className={` text-white `}>
            <div className="p-1">
              <h2 className="text-white text-2xl font-bold mb-6 inline p-1">
                <button
                  style={{ backgroundColor: "#1CC29F" }}
                  className="font-semibold bg-blue-500 text-white px-4 py-1 ml-2 rounded-full 
      hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300 text-lg"
                  onClick={() => navigate("/add-friend")}>
                  Add Friend
                </button>
              </h2>
            </div>
            <div className="ml-1">
              <Button className="m-1" onClick={toggleModal}>
                <img
                  className="mr-1 p-1"
                  width="40"
                  height="40"
                  src="/assets/icons/debt3.png"
                  alt="paytm"
                />
                Simplify Debts
              </Button>
            </div>
          </div>

          {isGroupsActivityLoading ||
          isUserGroupsLoading ||
          isfriendListLoading ? (
            <Loader />
          ) : userFriends.length === 0 &&
            !isUserGroupsLoading &&
            !isfriendListLoading ? (
            <span className="text-white font-bold mb-2">
              You have no friends
            </span>
          ) : (
            <div
              style={{ maxHeight: "470px", overflowY: "auto" }}
              className={`custom-scrollbar mt-2`}
              onScroll={handleScroll}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFriends.map((friend: Models.Document) => {
                  const updatedUserFriendsID = friend.$id;
                  const { userCanPay, friendCanPay } = processTransactions(
                    userId || "",
                    jsonData || [],
                    updatedUserFriendsID || []
                  );

                  return (
                    <li
                      key={friend.$id}
                      className="bg-slate-800 p-4 shadow-md rounded-md text-white">
                      <UserCard
                        user={friend}
                        userCanPay={userCanPay}
                        friendCanPay={friendCanPay}
                      />
                    </li>
                  );
                })}
                {scrollTop < 50 && <Scrollicon />}
              </ul>
            </div>
          )}
          {modal && userGroupsData && simplifiedData2.length > 0 && (
            <div className="modal">
              <div onClick={toggleModal} className="overlay"></div>

              <div className="modal-content">
                <div className="py-1">
                  <div className="flex justify-between">
                    <div className="py-2">
                      <h2 className="text-neutral-200 text-2xl font-bold inline">
                        Simplify Debts
                      </h2>
                    </div>

                    <div className="ml-1">
                      <button className="m-1" onClick={toggleModal}>
                        <img
                          className="mr-1 p-1"
                          width="40"
                          height="40"
                          src="/assets/icons/close.png"
                          alt="close"
                        />
                      </button>
                    </div>
                  </div>

                  {simplifiedData2.map((item: any) => (
                    <p key={`${item.from}-${item.to}`}>
                      <span
                        className={`text-lg font-bold inline ${
                          user?.name === item.from
                            ? "text-sky-300"
                            : "text-neutral-400"
                        }`}>
                        "{item.from}"
                      </span>{" "}
                      owes{" "}
                      <span
                        className={`text-lg font-bold inline ${
                          user?.name === item.to
                            ? "text-sky-300"
                            : "text-neutral-400"
                        }`}>
                        "{item.to}"{" "}
                      </span>{" "}
                      <span className="text-lg font-bold text-red">
                        &#8377;&nbsp;{item.amount.toFixed(1)}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFriends;
