import express from "express";
import { getUserModel } from "../model/User";
import { AppError } from "../shared/errors";
const User = getUserModel();


export async function getAllUnActivatedUsers(
  req: express.Request,
  res: express.Response
) {
  const users = await User.find({ isActive: false }).exec();
  res.status(200).json(users);
}

export async function getAllUsers(  
  req: express.Request,
  res: express.Response
  ){
    const activated = req.query.activated;
    if(activated){
      const users = await User.find({ isActive: true }).exec();
      res.status(200).json(users);
    }else{
      const users = await User.find({ isActive: false }).exec();
      res.status(200).json(users);
    }
}

export async function activateUser(
  req: express.Request,
  res: express.Response
){
  const userId = req.params.id;
  const approve = req.query.approve;
  const user = await User.findById(userId);
  if(!user) throw new AppError('This user does not exist.', 401);
  try{
    if(approve){
      user.isActive = true;
      await user.save();
      return res.status(200).json(user);
    }else{
      await user.deleteOne();
      return res.status(200).json({ message: 'User is deleted.' });
    }
  }catch(err:any){
    return res.status(400).json({ message: err.message });
  }

}