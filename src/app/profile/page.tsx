"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconBolt, IconCheck, IconRobot, IconStarFilled, IconUser, IconUsersGroup } from "@tabler/icons-react";
import RequestForm from "@/components/request-form";

type Profile={id:string;kind:"human"|"agent"|"hybrid";name:string;headline:string;description:string;skills:string[];rating:string;review_count:number;completed_count:number;price_amount:string;price_unit:string;is_verified:boolean};
const typeLabel={human:"Chuyên gia",agent:"AI Agent",hybrid:"Hybrid team"};
const unitLabel:Record<string,string>={hour:"giờ",month:"tháng",project:"dự án",run:"lượt chạy"};

export default function ProfilePage(){
  const [profile,setProfile]=useState<Profile|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{const timer=window.setTimeout(async()=>{const source=new URLSearchParams(window.location.search);const params=new URLSearchParams();if(source.get("id"))params.set("id",source.get("id")!);else if(source.get("slug"))params.set("slug",source.get("slug")!);else{setError("Hồ sơ không hợp lệ.");setLoading(false);return}try{const response=await fetch(`/api/listings?${params}`);if(!response.ok)throw new Error();const result=await response.json() as {data:Profile};setProfile(result.data)}catch{setError("Không tìm thấy hồ sơ này.")}finally{setLoading(false)}},0);return()=>window.clearTimeout(timer)},[]);
  if(loading)return <PageState text="Đang tải hồ sơ..."/>;if(error||!profile)return <PageState text={error||"Không tìm thấy hồ sơ."}/>;
  const Icon=profile.kind==="agent"?IconRobot:profile.kind==="human"?IconUser:IconUsersGroup;
  const action=profile.kind==="agent"?"Thuê AI Agent":profile.kind==="human"?"Mời chuyên gia":"Thuê hybrid team";
  return <main className="detail-page"><Nav back="/explore"/><section className="detail-hero"><div className="container profile-heading"><div className={`detail-avatar avatar-${profile.kind}`}><Icon size={36}/></div><div><span className={`type-pill type-${profile.kind}`}>{typeLabel[profile.kind]}</span><h1>{profile.name}</h1><p>{profile.headline}</p></div></div></section><div className="container detail-layout"><section className="detail-content"><div className="detail-block"><h2>Giới thiệu</h2><p>{profile.description}</p></div><div className="detail-block"><h2>{profile.kind==="agent"?"Khả năng & tích hợp":"Kỹ năng nổi bật"}</h2><div className="skill-grid">{profile.skills.map(skill=><span key={skill}><IconCheck size={16}/>{skill}</span>)}</div></div><div className="detail-block"><h2>Cách làm việc</h2><div className="work-points"><p><IconBolt/> Nhận brief và xác nhận phạm vi</p><p><IconCheck/> Thực hiện theo milestone minh bạch</p><p><IconStarFilled/> Bàn giao, nghiệm thu và đánh giá</p></div></div></section><aside className="detail-side"><div className="profile-stats"><div><strong>{profile.rating}</strong><span><IconStarFilled size={13}/> {profile.review_count} đánh giá</span></div><div><strong>{profile.completed_count.toLocaleString("vi-VN")}</strong><span>{profile.kind==="agent"?"lượt chạy":"việc hoàn thành"}</span></div></div><div className="detail-price"><span>Giá từ</span><strong>${Number(profile.price_amount).toLocaleString("en-US")}/{unitLabel[profile.price_unit]??profile.price_unit}</strong></div><h2>{action}</h2><p>Gửi nhu cầu để bắt đầu trao đổi. Bạn chưa cần thanh toán ở bước này.</p><RequestForm targetType="profile" targetId={profile.id} buttonLabel={action} defaultMessage={`Tôi muốn trao đổi về dịch vụ ${profile.name}.`}/></aside></div></main>;
}
function Nav({back}:{back:string}){return <header className="sub-nav"><div className="container sub-nav-inner"><Link href="/" className="brand"><span className="brand-mark"><span/></span>jobflat</Link><Link href={back}><IconArrowLeft size={17}/> Quay lại</Link></div></header>}
function PageState({text}:{text:string}){return <main><Nav back="/explore"/><div className="container standalone-state">{text}<Link href="/explore">Khám phá marketplace</Link></div></main>}
